/** @format */

import type { ParsedNotationFrame } from "./method/notationTypes";
import { getNotationFrameRate } from "./method/notationMethods";
import { renderFrame } from "./notationRender";
export { parseNotation } from "./method/notationMethods";
export {
	buildWavePoints,
	drawNote,
	drawShow,
	drawTapNote,
	drawHoldNote,
	drawDragNote,
	drawTailNote,
	renderFrame,
} from "./notationRender";

/**
 * 调用者每次通过 `gen.next(frameIndex)` 传入当前帧索引，生成器会推进到该帧并绘制。
 * 返回值通过 `yield` 形式传回，类型见 `FrameRenderInfo`。
 */
/**
 * 表示当前帧中各类 note 的计数信息。
 */
/**
 * 当前帧中不同颜色音符的计数信息。
 */
export interface CurrentNoteCount {
	// 每种颜色的计数（unknownColor 用于未识别的颜色）
	[color: string]: number;
	/** 总音符数。 */
	total: number;
}

/**
 * 生成器每次返回给调用者的帧渲染信息。
 */
export interface FrameRenderInfo {
	frameIndex: number;
	time: number;
	// 当前帧数据（可能为 undefined，当播放结束或尚未生成时）
	frame?: ParsedNotationFrame;
	// 兼容字段：当前帧
	currentFrame?: ParsedNotationFrame;
	// 各类 note 的计数
	currentNote: CurrentNoteCount;
	// 控制回调：暂停、继续、退出
	pause: () => void;
	resume: () => void;
	quit: () => void;
	// 是否已结束
	done: boolean;
}

/**
 * 播放器的控制选项。
 */
export interface NotationPlaybackOptions {
	/** 是否在初始化后立即自动播放。 */
	autoPlay?: boolean;
	/** 使用的播放帧率。 */
	frameRate?: number;
	/** 每次渲染新帧时触发的回调。 */
	onFrame?: (info: FrameRenderInfo) => void;
	/** 播放结束时触发的回调。 */
	onDone?: (info: FrameRenderInfo | null) => void;
}

/**
 * 播放器控制器，暴露播放、暂停、继续、停止及单步推进能力。
 */
export interface NotationPlaybackController {
	/** 开始或继续播放。 */
	play: () => void;
	/** 暂停当前播放。 */
	pause: () => void;
	/** 继续播放。 */
	resume: () => void;
	/** 停止播放。 */
	stop: () => void;
	/** 推进到指定帧或下一帧。 */
	step: (targetFrame?: number) => FrameRenderInfo | null;
}

/**
 * 启动谱面播放控制器，按帧率自动推进并渲染当前帧。
 * @param ctx Canvas 渲染上下文
 * @param notationGenerator 逐帧产出谱面帧的生成器
 * @param options 播放控制选项
 * @returns 可用于控制播放状态的控制器
 */
// 启动播放控制器，按帧率推进 generator 并触发每帧渲染与回调。
export function startNotationPlayback(
	ctx: CanvasRenderingContext2D,
	notationGenerator: Generator<
		ParsedNotationFrame,
		void,
		unknown
	>,
	options: NotationPlaybackOptions = {},
): NotationPlaybackController {
	// 以目标帧率换算每帧的时间间隔，确保播放节奏与注释帧一致。
	const frameDuration =
		1000 /
		(options.frameRate ?? getNotationFrameRate());
	// 生成器会逐帧推进并返回当前帧的渲染状态信息。
	const generator = notationPlay(ctx, notationGenerator);
	// 定时器用于按节奏触发 step，控制播放时钟。
	let timer: ReturnType<
		typeof globalThis.setInterval
	> | null = null;
	// 当前是否处于播放状态，允许暂停/恢复切换。
	let running = options.autoPlay ?? true;
	// 停止后不再继续推进，避免重复消费生成器。
	let stopped = false;
	// 记录最新的一帧结果，供 pause/resume/stop 调用时复用状态。
	let latestInfo: FrameRenderInfo | null = null;

	// 清理当前定时器，避免多个 interval 叠加导致帧率紊乱。
	const clearTimer = () => {
		if (timer !== null) {
			globalThis.clearInterval(timer);
			timer = null;
		}
	};

	// 推进到指定帧或下一帧，并在必要时触发渲染回调与完成回调。
	const step = (
		targetFrame?: number,
	): FrameRenderInfo | null => {
		if (stopped) {
			return null;
		}

		let result = generator.next(targetFrame);
		let info = result.value as FrameRenderInfo | null;
		while (!result.done && info === null) {
			result = generator.next(targetFrame);
			info = result.value as FrameRenderInfo | null;
		}
		latestInfo = info;
		if (info) {
			options.onFrame?.(info);
		}
		if (result.done || info?.done) {
			stopped = true;
			clearTimer();
			options.onDone?.(info ?? null);
		}
		return info;
	};

	// 启动定时器，以固定帧间隔连续推进播放进度。
	const schedule = () => {
		clearTimer();
		if (stopped || !running) {
			return;
		}
		timer = globalThis.setInterval(() => {
			if (!running || stopped) {
				clearTimer();
				return;
			}
			const info = step();
			if (info?.done) {
				clearTimer();
			}
		}, frameDuration);
	};

	// 从头开始或继续播放，并在首次播放时手动推进一帧。
	const play = () => {
		if (stopped) {
			return;
		}
		latestInfo?.resume?.();
		running = true;
		if (!latestInfo) {
			step();
		}
		schedule();
	};

	// 暂停播放，保留当前状态，等待后续 resume 恢复。
	const pause = () => {
		running = false;
		clearTimer();
		latestInfo?.pause?.();
	};

	// 在暂停状态下恢复计时器，并继续按帧推进。
	const resume = () => {
		if (stopped) {
			return;
		}
		latestInfo?.resume?.();
		running = true;
		if (!latestInfo) {
			step();
		}
		schedule();
	};

	// 立即终止播放并清理资源，调用当前帧的 quit 逻辑。
	const stop = () => {
		stopped = true;
		clearTimer();
		latestInfo?.quit?.();
	};

	// 若配置允许自动播放，则在初始化后立即启动。
	if (options.autoPlay ?? true) {
		play();
	}

	return {
		play,
		pause,
		resume,
		stop,
		step,
	};
}

/**
 * 生成器：接收 `notationGenerator` 并根据外部提供的帧索引推进绘制。
 * 用法：
 * const gen = notationPlay(ctx, parseNotation(notation));
 * gen.next(0); // 绘制第 0 帧，返回帧信息
 * gen.next(1); // 绘制第 1 帧，返回帧信息
 */
// 生成器负责推进到目标帧、执行当前帧渲染，并把状态通过 yield 返回给调用方。
export default function* notationPlay(
	ctx: CanvasRenderingContext2D,
	notationGenerator: Generator<
		ParsedNotationFrame,
		void,
		unknown
	>,
): Generator<
	FrameRenderInfo | null,
	void,
	number | undefined
> {
	let lastIndex = -1;
	let lastFrame: ParsedNotationFrame | undefined;

	// 控制状态：paused/quit
	let paused = false;
	let quitFlag = false;

	// 控制回调实现（闭包绑定当前生成器状态）
	const pause = () => {
		paused = true;
	};
	const resume = () => {
		paused = false;
	};
	const quit = () => {
		quitFlag = true;
	};

	// helper: 统计当前帧中各类 note 的个数
	const countNotes = (
		frame?: ParsedNotationFrame,
	): CurrentNoteCount => {
		const counts: CurrentNoteCount = {
			total: 0,
		} as CurrentNoteCount;
		if (!frame) return counts;
		for (const track of Object.values(
			frame.tracks ?? {},
		)) {
			if (!track) continue;
			for (const note of track.notes) {
				const c =
					(note as { color?: string }).color ??
					"unknownColor";
				counts[c] = (counts[c] || 0) + 1;
				counts.total += 1;
			}
		}
		return counts;
	};

	// 首次等待调用者提供希望绘制的帧索引（可为 undefined，表示下一帧）
	let requested = (yield null) as number | undefined;

	// 主循环：每次根据 requested 推进到目标帧并绘制，然后 yield 当前帧信息
	while (true) {
		// 如果被 quit，返回结束信息并终止生成器
		if (quitFlag) {
			const endInfo: FrameRenderInfo = {
				frameIndex: lastIndex,
				time: lastFrame?.time ?? 0,
				frame: lastFrame,
				currentFrame: lastFrame,
				currentNote: countNotes(lastFrame),
				pause,
				resume,
				quit,
				done: true,
			};
			yield endInfo;
			return;
		}

		// 如果处于暂停状态，不推进生成器，只返回当前帧信息
		if (paused) {
			const pausedInfo: FrameRenderInfo = {
				frameIndex: lastIndex,
				time: lastFrame?.time ?? 0,
				frame: lastFrame,
				currentFrame: lastFrame,
				currentNote: countNotes(lastFrame),
				pause,
				resume,
				quit,
				done: false,
			};
			requested = (yield pausedInfo) as
				| number
				| undefined;
			continue;
		}

		const target =
			typeof requested === "number"
				? requested
				: lastIndex + 1;

		// 推进 notationGenerator 到目标帧（向前推进）
		while (lastIndex < target) {
			const res = notationGenerator.next();
			lastIndex += 1;
			if (res.done) {
				const info: FrameRenderInfo = {
					frameIndex: lastIndex,
					time: lastFrame?.time ?? 0,
					frame: undefined,
					currentFrame: undefined,
					currentNote: countNotes(lastFrame),
					pause,
					resume,
					quit,
					done: true,
				};
				// 将结束信息返回给调用者，然后终止生成器
				yield info;
				return;
			}
			lastFrame = res.value;
		}

		// 绘制当前帧（如果有）
		if (lastFrame) {
			renderFrame(ctx, lastFrame);
		}

		// 构建并返回当前帧信息（包含计数与控制回调）
		const info: FrameRenderInfo = {
			frameIndex: lastIndex,
			time: lastFrame?.time ?? 0,
			frame: lastFrame,
			currentFrame: lastFrame,
			currentNote: countNotes(lastFrame),
			pause,
			resume,
			quit,
			done: false,
		};

		// 等待下一次调用，调用者可以传入新的 requested 帧索引
		requested = (yield info) as number | undefined;
	}
}
