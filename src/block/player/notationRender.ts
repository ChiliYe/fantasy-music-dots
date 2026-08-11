/** @format */

import type { ParsedNotationFrame } from "./method/notationTypes";
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

export function resolveNoteColor(
	note: ParsedNotationFrame["notes"][number],
) {
	return resolveDefaultNoteColor(note.color);
}

export function resolveNoteTrack(
	note: ParsedNotationFrame["notes"][number],
): NoteTrackInfo {
	return resolveDefaultTrackGeometry(note.track);
}

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

export function resolveShowElapsed(
	frame: ParsedNotationFrame,
	show: ParsedNotationFrame["shows"][number],
) {
	return Math.max(0, frame.time - show.time);
}

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

export function drawNote(
	ctx: CanvasRenderingContext2D,
	frame: ParsedNotationFrame,
	track: NoteTrackInfo,
	note: ParsedNotationFrame["notes"][number],
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

	frame.notes.forEach((note, index) =>
		drawNote(
			ctx,
			frame,
			resolveNoteTrack(note),
			note,
			index,
		),
	);
	frame.shows.forEach((show) =>
		drawShow(ctx, frame, show),
	);
}

function getDefaultFrameDuration() {
	return 1000 / 60;
}
