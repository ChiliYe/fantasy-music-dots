/** @format */

import type {
	ParsedNotationFrame,
	ParsedNotationNote,
} from "./notationTypes";

/**
 * 根据轨道事件生成一个统一格式的音符条目。
 * @param params 构造参数集合。
 * @returns 统一格式的音符对象。
 * @example
 * const entry = createNoteEntry({ color: "red", trackLayer, currentTime: 0, frameDuration: 16.67 });
 */
function createNoteEntry(params: {
	color: string;
	trackLayer: notationTrackLayer;
	currentTime: number;
	frameDuration: number;
}): ParsedNotationNote {
	const {
		color,
		trackLayer,
		currentTime,
		frameDuration,
	} = params;
	const eventSummary = [
		...(trackLayer.eventLayers ?? []).flatMap(
			(eventLayer) => [
				...(eventLayer.alphaEvents ?? []).map(
					() => "alpha",
				),
				...(eventLayer.moveXEvents ?? []).map(
					() => "moveX",
				),
				...(eventLayer.moveYEvents ?? []).map(
					() => "moveY",
				),
				...(eventLayer.rotateEvents ?? []).map(
					() => "rotate",
				),
				...(eventLayer.speedEvents ?? []).map(
					() => "speed",
				),
			],
		),
	];

	return {
		color,
		layer: color,
		key: trackLayer.key,
		comment:
			eventSummary.length > 0
				? `// ${color} note with ${eventSummary.slice(0, 3).join(",")}`
				: `// ${color} note`,
		effect:
			eventSummary.length > 0
				? {
						type: eventSummary[0],
						startTime: currentTime,
						duration: frameDuration,
					}
				: undefined,
	};
}

/**
 * 根据当前帧生成音符数组。
 * @param trackEntries 当前有效音轨集合。
 * @param currentTime 当前帧时间。
 * @param frameDuration 当前帧时长。
 * @returns 当前帧对应的音符集合。
 * @example
 * const notes = buildNotes([["red", trackLayer]], 0, 16.67);
 */
export function buildNotes(
	trackEntries: Array<[string, notationTrackLayer]>,
	currentTime: number,
	frameDuration: number,
): ParsedNotationFrame["notes"] {
	return trackEntries.map(([color, trackLayer]) =>
		createNoteEntry({
			color,
			trackLayer,
			currentTime,
			frameDuration,
		}),
	);
}
