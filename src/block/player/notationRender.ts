/** @format */

import type {
	ParsedNotationFrame,
	ParsedNotationNote,
} from "./method/notationTypes";
import { circleBrush } from "../../general/pattern/circle";
import { forkLineBrush } from "../../general/pattern/forkLine";
import { verticalLineBrush } from "../../general/pattern/verticalLine";
import { waveBrush } from "../../general/pattern/wave";
import {
	createNumberIterator,
	resolveNumberTransition,
	type NumberIterator,
} from "../../general/frameLoader/animation/numberTransition";
import {
	getDefaultBackgroundFillStyle,
	getDefaultDragLineLength,
	getDefaultHoldLength,
	getDefaultNoteRadius,
	getDefaultShowFillStyle,
	getDefaultShowFont,
	getDefaultTailPointLength,
	resolveDefaultNoteColor,
	resolveDefaultTrackGeometry,
} from "./notationRenderDefaults";

// 记录每个 show 的 alpha 过渡状态，保证 fadeIn 只在当前 show 上维护独立计数器。
const showAlphaTransitions = new WeakMap<
	ParsedNotationFrame["shows"][number],
	NumberIterator
>();

export interface NoteTrackInfo {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
}

export interface NoteRenderGeometry {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	anchorX: number;
	anchorY: number;
	directionX: number;
	directionY: number;
}

// 把轨道信息转换成绘制需要的几何参数，包括起点、终点和方向向量。
export function resolveNoteRenderGeometry(
	track: NoteTrackInfo,
): NoteRenderGeometry {
	return {
		startX: track.startX,
		startY: track.startY,
		endX: track.endX,
		endY: track.endY,
		anchorX: track.startX,
		anchorY: track.startY,
		directionX: track.endX - track.startX,
		directionY: track.endY - track.startY,
	};
}

// 根据 note 颜色解析出真正用于 canvas 的颜色值。
export function resolveNoteColor(note: ParsedNotationNote) {
	return resolveDefaultNoteColor(note.color);
}

// 根据 note 的轨道描述返回该 note 的可绘制轨道几何信息。
export function resolveNoteTrack(
	note: ParsedNotationNote,
): NoteTrackInfo {
	return resolveDefaultTrackGeometry(note.track);
}

// 生成一段波浪路径，用于 hold 线的自然晃动效果。
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

// 画出单击型 note 的圆形点，作为 tap 的最小可见单位。
export function drawTapNote(
	ctx: CanvasRenderingContext2D,
	color: string | null,
	x: number,
	y: number,
) {
	circleBrush(ctx, {
		x,
		y,
		radius: getDefaultNoteRadius(),
		color: color ?? "#ffffff",
	});
}

// 画出长按型 note 的延伸波纹，表示轨道上的持续按压状态。
export function drawHoldNote(
	ctx: CanvasRenderingContext2D,
	color: string | null,
	x: number,
	y: number,
	trackDirX: number,
	trackDirY: number,
	length = getDefaultHoldLength(),
) {
	waveBrush(ctx, {
		x,
		y,
		directionX: trackDirX,
		directionY: trackDirY,
		length,
		color: color ?? "#ffffff",
	});
}

// 画出拖拽型 note 的连线，表示从起点到终点的滑动轨迹。
export function drawDragNote(
	ctx: CanvasRenderingContext2D,
	color: string | null,
	x: number,
	y: number,
	startX: number,
	startY: number,
	endX: number,
	endY: number,
) {
	verticalLineBrush(ctx, {
		x,
		y,
		length: getDefaultDragLineLength(),
		vxs: startX,
		vxe: endX,
		vys: startY,
		vye: endY,
		color: color ?? "#ffffff",
	});
}

// 画出尾点 note，组合起点、终点和当前点形成分叉型视觉。
export function drawTailNote(
	ctx: CanvasRenderingContext2D,
	color: string | null,
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
		length: getDefaultTailPointLength(),
		color: color ?? "#ffffff",
	});
}

// 计算演出从出现到当前帧经过的时间，用于后续动画状态判断。
export function resolveShowElapsed(
	frame: ParsedNotationFrame,
	show: ParsedNotationFrame["shows"][number],
) {
	return Math.max(0, frame.time - show.time);
}

// 计算 show 的 alpha 值，让 fadeIn 效果在时间轴上平滑出现。
export function resolveShowAlpha(
	frame: ParsedNotationFrame,
	show: ParsedNotationFrame["shows"][number],
) {
	if (show.effect !== "fadeIn") {
		return 1;
	}

	if (frame.time < show.time) {
		return 0;
	}

	if (frame.time >= show.time + show.duration) {
		return 1;
	}

	let iterator = showAlphaTransitions.get(show);
	if (!iterator) {
		const counts = Math.max(
			1,
			Math.ceil(
				show.duration / getDefaultFrameDuration(),
			),
		);
		iterator = createNumberIterator(0, 1, counts);
		showAlphaTransitions.set(show, iterator);
	}

	if (frame.time > show.time) {
		iterator.next();
	}

	const value = resolveNumberTransition(iterator, 0);
	return Math.max(0, Math.min(1, value));
}

/**
 * 绘制单个音符
 * @param ctx 绘制上下文
 * @param frame 当前帧对象
 * @param track 所在轨信息
 * @param note 音符对象
 * @param index 索引
 * @returns
 */
// 根据 note 的 key 分发到不同的绘制函数，实现同一 note 的多种视觉形态。
export function drawNote(
	ctx: CanvasRenderingContext2D,
	frame: ParsedNotationFrame,
	track: NoteTrackInfo,
	note: ParsedNotationNote,
	index: number,
) {
	ctx.save();
	const color = resolveNoteColor(note);
	const geometry = resolveNoteRenderGeometry(track);

	switch (note.key) {
		case 1:
			drawTapNote(
				ctx,
				color,
				geometry.anchorX,
				geometry.anchorY,
			);
			break;
		case 2:
			drawDragNote(
				ctx,
				color,
				geometry.anchorX,
				geometry.anchorY,
				geometry.startX,
				geometry.startY,
				geometry.endX,
				geometry.endY,
			);
			break;
		case 3:
			drawHoldNote(
				ctx,
				color,
				geometry.anchorX,
				geometry.anchorY,
				geometry.directionX,
				geometry.directionY,
			);
			break;
		case 4:
			drawTailNote(
				ctx,
				color,
				geometry.anchorX,
				geometry.anchorY,
				geometry.startX,
				geometry.startY,
				geometry.endX,
				geometry.endY,
			);
			break;
	}

	ctx.restore();
	return { ctx, frame, track, note, index };
}

// 将文本演出按当前 alpha 和位移信息绘制到 canvas 上。
export function drawShow(
	ctx: CanvasRenderingContext2D,
	frame: ParsedNotationFrame,
	show: ParsedNotationFrame["shows"][number],
) {
	ctx.save();
	ctx.globalAlpha = resolveShowAlpha(frame, show);
	ctx.translate(show.x, show.y);
	ctx.font = getDefaultShowFont();
	ctx.fillStyle = getDefaultShowFillStyle();
	ctx.fillText(show.content, 0, 0);
	ctx.restore();
	return { ctx, frame, show };
}

// 统一清空、填背景、绘制所有 notes 和 shows，形成当前帧的最终画面。
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
	ctx.fillStyle = getDefaultBackgroundFillStyle();
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	Object.values(frame.tracks ?? {}).forEach((track) => {
		if (!track) return;
		track.notes.forEach((note, index) =>
			drawNote(
				ctx,
				frame,
				resolveNoteTrack(note),
				note,
				index,
			),
		);
	});
	frame.shows.forEach((show) =>
		drawShow(ctx, frame, show),
	);
}

function getDefaultFrameDuration() {
	return 1000 / 60;
}
