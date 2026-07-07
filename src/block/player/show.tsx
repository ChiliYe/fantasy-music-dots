/** @format */

import type { ParsedNotationFrame } from "./notationParse";

/**
 * 使用 notationParse 生成的帧数据播放谱面。
 * 目前只完成谱面播放，音乐播放暂时不接入。
 *
 * @example
 * const canvas = document.createElement("canvas");
 * const ctx = canvas.getContext("2d");
 * const stop = PlayerShow(ctx!, notationParse(notation)[Symbol.iterator]());
 * return () => stop();
 */
export default function PlayerShow(
	ctx: CanvasRenderingContext2D,
	notationGenerator: Iterator<ParsedNotationFrame>,
): () => void {
	// 播放状态开关，控制整个播放器是否继续推进。
	let running = true;

	// 预留：后续可在这里接入音频播放、节拍同步和时间轴控制。
	const scheduleNextFrame = () => {
		if (!running) return;

		// 根据运行环境选择 requestAnimationFrame 或回退定时器。
		const raf =
			typeof globalThis.requestAnimationFrame ===
			"function"
				? globalThis.requestAnimationFrame.bind(
						globalThis,
					)
				: (callback: FrameRequestCallback) =>
						window.setTimeout(
							() => callback(Date.now()),
							16,
						);

		// 使用下一帧回调驱动播放流程，形成连续动画。
		raf(() => renderNextFrame());
	};

	// 目前已完成：根据当前帧的音符数据绘制简化的谱面节点。
	const drawNote = (
		frame: ParsedNotationFrame,
		note: ParsedNotationFrame["notes"][number],
		index: number,
	) => {
		// 颜色映射，用于为不同音轨的音符分配视觉样式。
		const colorMap: Record<string, string> = {
			red: "#ff6b6b3c",
			blue: "#4dabf749",
			yellow: "#ffd53b33",
			green: "#69db7c4f",
			purple: "#b097fc79",
		};

		// 音符在画布中的坐标由索引和颜色分层计算得到。
		const fillStyle = colorMap[note.color] ?? "#ffffff";
		const x = 40 + index * 48;
		const y = 90 + (note.color === "purple" ? 32 : 0);

		// 保存当前绘图状态，避免后续样式变化影响已有内容。
		ctx.save();
		ctx.fillStyle = fillStyle;
		ctx.beginPath();
		ctx.arc(x, y, 12, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#ffffff";
		ctx.font = "11px sans-serif";
		ctx.fillText(note.comment, x - 22, y + 28);

		// 恢复之前的绘图状态，保证后续绘制互不干扰。
		ctx.restore();
	};

	// 目前已完成：根据当前帧的文字演出数据绘制效果动画。
	const drawShow = (
		frame: ParsedNotationFrame,
		show: ParsedNotationFrame["shows"][number],
	) => {
		// 根据当前时间与演出时长计算当前动画进度。
		const progress = Math.min(
			Math.max(
				(frame.time - show.time) /
					Math.max(show.duration, 1),
				0,
			),
			1,
		);

		// 文字演出会根据效果类型调整透明度、位移和缩放。
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

		// 保存绘图上下文后再应用局部变换，避免污染后续绘制。
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.translate(x, y);
		ctx.scale(scale, scale);
		ctx.font = "20px sans-serif";
		ctx.fillStyle = "#f8f9fa";
		ctx.fillText(show.content, 0, 0);

		// 还原当前绘图状态，保证后面的绘制不受影响。
		ctx.restore();
	};

	// 预留：这里后续可以加入判定线、连击、打击反馈等谱面交互层。
	const renderNextFrame = () => {
		if (!running) return;

		// 从解析器中取出下一帧数据，如果结束则停止播放。
		const result = notationGenerator.next();
		if (result.done) {
			running = false;
			return;
		}

		// 清空上一帧内容，重新绘制新的背景与谱面元素。
		ctx.clearRect(
			0,
			0,
			ctx.canvas.width,
			ctx.canvas.height,
		);
		ctx.fillStyle = "#111827";
		ctx.fillRect(
			0,
			0,
			ctx.canvas.width,
			ctx.canvas.height,
		);

		// 使用当前帧的数据分别绘制音符与文字演出。
		const frame = result.value;
		frame.notes.forEach((note, index) =>
			drawNote(frame, note, index),
		);
		frame.shows.forEach((show) =>
			drawShow(frame, show),
		);

		// 继续调度下一帧，形成连续的谱面播放动画。
		scheduleNextFrame();
	};

	// 启动首次帧调度，播放器开始工作。
	scheduleNextFrame();

	return () => {
		// 预留：后续可在这里补充停止播放时的资源清理逻辑。
		running = false;
	};
}
