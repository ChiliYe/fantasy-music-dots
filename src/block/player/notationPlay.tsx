/** @format */

import type { ParsedNotationFrame } from "./method/notationTypes";
import { circleBrush } from "../../general/pattern/circle";
import { forkLineBrush } from "../../general/pattern/forkLine";
import { verticalLineBrush } from "../../general/pattern/verticalLine";
import { waveBrush } from "../../general/pattern/wave";
export { parseNotation } from "./method/notationMethods";

const colorMap: Record<string, string> = {
	red: "#ea1b1b",
	blue: "#2c84cd",
	yellow: "#e0b725",
	green: "#69db7c",
	purple: "#b097fc",
};

/**
 * 调用者每次通过 `gen.next(frameIndex)` 传入当前帧索引，生成器会推进到该帧并绘制。
 * 返回值通过 `yield` 形式传回，类型见 `FrameRenderInfo`。
 */
/**
 * 表示当前帧中各类 note 的计数信息。
 */
export interface CurrentNoteCount {
	// 每种颜色的计数（unknownColor 用于未识别的颜色）
	[color: string]: number;
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
 * 绘制tap note
 * @param ctx Canvas 渲染上下文
 * @param color note 的颜色
 * @param x note 的 x 坐标
 * @param y note 的 y 坐标
 */
export function drawTapNote(
	ctx: CanvasRenderingContext2D,
	color: string,
	x: number,
	y: number,
) {
	// 绘制一个圆形表示 tap note
	// ctx.save();

	circleBrush(ctx, { x: x, y: y, radius: 5, color });
	// ctx.restore();
}

/**
 * 生成一条从锚点出发、沿给定方向延伸的波浪路径点。
 *
 * 该函数会把一条直线看作轨道基准线，并沿着轨道法线方向施加正弦偏移，
 * 从而得到视觉上像“连续波形”的路径点。常用于绘制 hold note 或其他节奏类轨迹。
 *
 * @param anchorX 锚点 x 位置
 * @param anchorY 锚点 y 位置
 * @param trackDirX 轨道方向向量 x
 * @param trackDirY 轨道方向向量 y
 * @param length 波浪在轨道上占用的长度
 * @param amplitude 波浪振幅，值越大波峰越高
 * @param wavelength 波长，值越大波形越稀疏
 * @param steps 采样点数量，越多曲线越平滑
 * @returns 包含一组波浪点的数组，按绘制顺序排列
 */
export function buildWavePoints(
	anchorX: number,
	anchorY: number,
	trackDirX: number,
	trackDirY: number,
	length: number,
	amplitude = 5,
	wavelength = 10,
	steps = 90,
) {
	const points: Array<{ x: number; y: number }> = [];
	const trackLength =
		Math.hypot(trackDirX, trackDirY) || 1;
	const unitX = trackDirX / trackLength;
	const unitY = trackDirY / trackLength;
	const normalX = -unitY;
	const normalY = unitX;
	const cycles = length / Math.max(wavelength, 1);

	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const offsetAlongTrack = t * length;
		const x = anchorX + unitX * offsetAlongTrack;
		const y = anchorY + unitY * offsetAlongTrack;
		const waveOffset =
			Math.sin(t * Math.PI * 2 * cycles) * amplitude;
		points.push({
			x: x + normalX * waveOffset,
			y: y + normalY * waveOffset,
		});
	}

	return points;
}

/**
 * 绘制 hold note 的波浪线。
 *
 * 以给定锚点为起点，沿着轨道方向绘制一段指定长度的波浪线，
 * 适用于音乐节奏类游戏中的长按状态展示。
 *
 * @param ctx Canvas 渲染上下文
 * @param color 波浪颜色
 * @param x 锚点 x 坐标
 * @param y 锚点 y 坐标
 * @param trackDirX 轨道方向向量 x
 * @param trackDirY 轨道方向向量 y
 * @param length 波浪在轨道上占用的长度
 *
 * @example
 * const canvas = document.getElementById("canvas") as HTMLCanvasElement;
 * const ctx = canvas.getContext("2d")!;
 * drawHoldNote(ctx, "#ff0000", 100, 100, 1, 0, 80);
 */
export function drawHoldNote(
	ctx: CanvasRenderingContext2D,
	color: string,
	x: number,
	y: number,
	trackDirX: number,
	trackDirY: number,
	length: number,
) {
	waveBrush(ctx, {
		x,
		y,
		directionX: trackDirX,
		directionY: trackDirY,
		length,
		color,
	});
}

/**
 * 绘制drag note
 * @param ctx Canvas 渲染上下文
 * @param color note 的颜色
 * @param x note 的 x 坐标
 * @param y note 的 y 坐标
 * @param startX track 的起始 x 坐标
 * @param startY track 的起始 y 坐标
 * @param endX track 的结束 x 坐标
 * @param endY track 的结束 y 坐标
 */
export function drawDragNote(
	ctx: CanvasRenderingContext2D,
	color: string,
	x: number,
	y: number,
	startX: number,
	startY: number,
	endX: number,
	endY: number,
) {
	// 绘制一个短垂线段表示 drag note
	// ctx.save();
	verticalLineBrush(ctx, {
		x: x,
		y: y,
		length: 20,
		vxs: startX,
		vxe: endX,
		vys: startY,
		vye: endY,
		color,
	});
	// ctx.restore();
}

/**
 * 绘制tail note
 * @param ctx Canvas 渲染上下文
 * @param color note 的颜色
 * @param x note 的锚点 x 坐标（选在线段上的点）
 * @param y note 的锚点 y 坐标（选在线段上的点）
 * @param startX 参考直线的起始 x 坐标
 * @param startY 参考直线的起始 y 坐标
 * @param endX 参考直线的结束 x 坐标
 * @param endY 参考直线的结束 y 坐标
 */
export function drawTailNote(
	ctx: CanvasRenderingContext2D,
	color: string,
	x: number,
	y: number,
	startX: number,
	startY: number,
	endX: number,
	endY: number,
) {
	forkLineBrush(ctx, {
		start: { x: startX, y: startY },
		end: { x: endX, y: endY },
		point: { x, y },
		length: 8,
		color,
	});
}

/**
 * 绘制单个 note
 * @param ctx Canvas 渲染上下文
 * @param frame 当前帧数据
 * @param track 轨道信息
 * @param note 当前 note 数据
 * @param index 当前 note 在帧中的索引
 */
export function drawNote(
	ctx: CanvasRenderingContext2D,
	frame: ParsedNotationFrame,
	track: {
		startX: number;
		startY: number;
		endX: number;
		endY: number;
	},
	note: ParsedNotationFrame["notes"][number],
	index: number,
) {
	ctx.save();
	const color = colorMap[note.color] ?? null;
	//根据note类型调用相应的函数绘制
	switch (note.key) {
		case 1: // tap note
			drawTapNote(
				ctx,
				color,
				track.startX,
				track.startY,
			);
			break;
		case 2: // drag note
			drawDragNote(
				ctx,
				color,
				track.startX,
				track.startY,
				track.startX,
				track.startY,
				track.endX,
				track.endY,
			);
			break;
		case 3: // hold note
			drawHoldNote(
				ctx,
				color,
				track.startX,
				track.startY,
				track.endX - track.startX,
				track.endY - track.startY,
				40,
			);
			break;
		// Add more cases for other note types if needed
	}
	ctx.restore();
	return { ctx, frame, track, note, index };
}

/**
 * 绘制单个 show
 * @param ctx 绘制上下文
 * @param frame 当前帧数据
 * @param show 表演数据
 */
export function drawShow(
	ctx: CanvasRenderingContext2D,
	frame: ParsedNotationFrame,
	show: ParsedNotationFrame["shows"][number],
) {
	const progress = Math.min(
		Math.max(
			(frame.time - show.time) /
				Math.max(show.duration, 1),
			0,
		),
		1,
	);

	let alpha = 1;
	let x = show.x;
	const y = show.y;
	let scale = 1;

	if (show.effect === "fadeIn") {
		alpha = progress;
	} else if (show.effect === "slide") {
		x = show.x + (1 - progress) * 40;
	} else if (show.effect === "zoom") {
		scale = 0.7 + progress * 0.3;
	}

	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.translate(x, y);
	ctx.scale(scale, scale);
	ctx.font = "20px sans-serif";
	ctx.fillStyle = "#f8f9fa";
	ctx.fillText(show.content, 0, 0);
	ctx.restore();
}

export function renderFrame(
	ctx: CanvasRenderingContext2D,
	frame: ParsedNotationFrame,
) {
	ctx.clearRect(
		0,
		0,
		ctx.canvas.width,
		ctx.canvas.height,
	);
	ctx.fillStyle = "#111827";
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	// frame.notes.forEach((note, index) =>
	// 	// drawNote(ctx, frame, note, index),
	// );
	frame.shows.forEach((s) => drawShow(ctx, frame, s));
}

/**
 * 生成器：接收 `notationGenerator` 并根据外部提供的帧索引推进绘制。
 * 用法：
 * const gen = notationPlay(ctx, parseNotation(notation));
 * gen.next(0); // 绘制第 0 帧，返回帧信息
 * gen.next(1); // 绘制第 1 帧，返回帧信息
 */
export default function* notationPlay(
	ctx: CanvasRenderingContext2D,
	notationGenerator: Iterator<ParsedNotationFrame>,
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
		for (const note of frame.notes) {
			const c =
				(note as { color?: string }).color ??
				"unknownColor";
			counts[c] = (counts[c] || 0) + 1;
			counts.total += 1;
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
