/** @format */

import { getNotationFrameRate } from "./notationMethods";
import type { ParsedNotationFrame } from "./notationTypes";
import { resolveDefaultTrackGeometry } from "../notationRenderDefaults";

//筛选出需要绘制的音符

/** 找出第一个 time 大于等于 target 的音符索引。 */
function lowerBound(
	notes: notationNoteInfo[],
	target: number,
): number {
	let left = 0;
	let right = notes.length;

	while (left < right) {
		const middle =
			left + Math.floor((right - left) / 2);
		if (notes[middle].time < target) {
			left = middle + 1;
		} else {
			right = middle;
		}
	}

	return left;
}

/** 获取音符打击时刻对应的流速，单位为像素/秒。 */
function resolveTrackSpeed(
	track: notationTrackLayer,
	noteTime: number,
): number {
	const speedEvents = (track.eventLayers ?? [])
		.flatMap((layer) => layer.speedEvents ?? [])
		.sort((a, b) => a.startTime - b.startTime);
	const activeEvent = speedEvents.find(
		(event) =>
			noteTime >= event.startTime &&
			noteTime < event.endTime,
	);
	const previousEvent = speedEvents.findLast(
		(event) => event.endTime <= noteTime,
	);
	const speed =
		activeEvent?.start ?? previousEvent?.end ?? 1;
	return Math.max(speed, 0.001);
}

/** 计算音符从轨道起点到判定点所需的提前时间，单位为毫秒。 */
function getNoteLeadTime(
	track: notationTrackLayer,
	noteTime: number,
): number {
	const geometry = resolveDefaultTrackGeometry({
		color: "red",
		layer: track,
	});
	const trackLength = Math.hypot(
		geometry.endX - geometry.startX,
		geometry.endY - geometry.startY,
	);
	return (
		(trackLength / resolveTrackSpeed(track, noteTime)) *
		1000
	);
}

/**
 * 筛选当前帧需要提前生成并渲染的音符。
 *
 * 对于打击时间为 hitTime 的音符，其可见区间是
 * [hitTime - leadTime, hitTime)。因此当前帧 [frame.time,
 * frame.time + frameDuration) 需要覆盖到的打击时间上界是：
 * frame.time + frameDuration + leadTime。
 *
 * 音符必须按 time 升序排列。
 */
export function collectNotes(
	frame: ParsedNotationFrame,
	frameDuration = 1000 / getNotationFrameRate(),
): notationNoteInfo[][] {
	const needRenderNotes: notationNoteInfo[][] = [];
	const trackColors: trackColor[] = [
		"red",
		"green",
		"blue",
		"yellow",
		"purple",
	];
	for (let i = 0; i < trackColors.length; i += 1) {
		const track = frame.tracks[trackColors[i]];
		const notes = track?.track.layer.notes ?? [];
		if (!track || notes.length === 0) {
			needRenderNotes[i] = [];
			continue;
		}

		const leadTime = Math.max(
			...notes.map((note) =>
				getNoteLeadTime(
					track.track.layer,
					note.time,
				),
			),
		);
		const renderEndTime =
			frame.time + frameDuration + leadTime;
		const startIndex = lowerBound(notes, frame.time);
		const endIndex = lowerBound(notes, renderEndTime);
		needRenderNotes[i] = notes.slice(
			startIndex,
			endIndex,
		);
	}

	return needRenderNotes;
}
