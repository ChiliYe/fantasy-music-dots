/**
 * 解析 notation 数据并生成可供渲染器消费的帧信息。
 *
 * 这里将帧率、音符构建、文字演出映射等步骤拆成独立函数，
 * 让主流程保持简洁，同时也方便后续扩展新的演出类型。
 *
 * @format
 * @example
 * const frames = parseNotation(notation);
 * const firstFrame = frames.next().value;
 * console.log(firstFrame.notes.length);
 */

import type {
	ParsedNotationFrame,
	ParsedNotationNote,
} from "./notationTypes";

/**
 * 读取谱面播放的目标帧率，优先使用全局变量，其次使用环境变量。
 * @returns 当前使用的帧率。
 */
export function getNotationFrameRate(): number {
	const runtime = globalThis as typeof globalThis & {
		__notationFrameRate?: number | string;
	};
	const envFrameRate = import.meta.env
		.VITE_NOTATION_FRAME_RATE;
	const frameRate = Number(
		runtime.__notationFrameRate ?? envFrameRate ?? 60,
	);
	return Number.isFinite(frameRate) && frameRate > 0
		? frameRate
		: 60;
}

/**
 * 根据帧率换算每帧所对应的毫秒时长。
 * @param frameRate 当前使用的帧率。
 * @returns 单帧毫秒时长。
 */
export function getFrameDuration(
	frameRate: number = getNotationFrameRate(),
): number {
	return 1000 / frameRate;
}

/**
 * 统计谱面中所有演出所覆盖的总时长。
 * @param notation 原始谱面数据。
 * @returns 最大结束时间。
 */
export function getTotalNotationTime(
	notation: notationFormat,
): number {
	return notation.shows.reduce(
		(maxTime, show) =>
			Math.max(maxTime, show.time + show.duration),
		0,
	);
}

/**
 * 计算需要生成多少帧才能覆盖所有演出时长。
 * @param notation 原始谱面数据。
 * @param frameDuration 单帧时长。
 * @returns 需要生成的总帧数。
 */
export function getFrameCount(
	notation: notationFormat,
	frameDuration: number = getFrameDuration(),
): number {
	const totalTime = getTotalNotationTime(notation);
	return Math.max(
		1,
		Math.ceil(totalTime / frameDuration),
	);
}

/**
 * 过滤出所有非空音轨，方便按轨道生成音符数据。
 * @param notation 原始谱面数据。
 * @returns 以颜色名为键的有效音轨列表。
 */
export function getTrackEntries(
	notation: notationFormat,
): Array<[trackColor, notationTrackLayer]> {
	return Object.entries(notation.track ?? {}).filter(
		([, layer]) => layer !== null,
	) as Array<[trackColor, notationTrackLayer]>;
}

/**
 * 生成音符的注释与效果描述。
 * @param params 构造参数集合。
 * @returns 统一格式的音符对象。
 */
/**
 * 根据轨道事件生成一个统一格式的音符条目。
 * @param params 构造参数集合。
 * @returns 统一格式的音符对象。
 * @example
 * const entry = createNoteEntry({ color: "red", trackLayer: trackLayerValue, currentTime: 0, frameDuration: 16.67 });
 */
function createNoteEntry(params: {
	color: trackColor;
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

	// 这里把事件类型摘要作为注释和效果来源，后续渲染器可直接消费。
	return {
		color,
		layer: color,
		key: trackLayer.key ?? trackLayer.notes?.[0]?.type,
		track: {
			color,
			layer: trackLayer,
		},
		comment:
			eventSummary.length > 0
				? `// ${color} note with ${eventSummary.slice(0, 3).join(",")}`
				: `// ${color} note`,
		currentTime,
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
 * const notes = buildNotes([['red', trackLayer]], 0, 16.67);
 */
export function buildNotes(
	trackEntries: Array<[trackColor, notationTrackLayer]>,
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

/**
 * 将文字演出映射为统一的效果描述，方便渲染器读取。
 * @param show 原始演出对象。
 * @returns 标准化后的演出配置。
 * @example
 * const resolved = resolveTextEffect({ type: "text", content: "Hello", x: 0, y: 0, duration: 1000, time: 0 });
 */
export function resolveTextEffect(show: notationShowInfo) {
	const envDefaultEffect =
		import.meta.env.VITE_NOTATION_DEFAULT_EFFECT ??
		"fadeIn";
	const effectType =
		show.type === "text" || show.type === "0"
			? envDefaultEffect
			: "none";

	return {
		effect: effectType,
		config: {
			content: show.content,
			x: show.x,
			y: show.y,
			duration: show.duration,
			time: show.time,
		},
	};
}

/**
 * 根据原始演出列表生成当前帧可消费的演出数组。
 * @param shows 原始演出列表。
 * @returns 标准化后的演出数组。
 */
/**
 * 根据原始演出列表生成当前帧可消费的演出数组。
 * @param shows 原始演出列表。
 * @returns 标准化后的演出数组。
 * @example
 * const shows = buildShows([{ type: "text", content: "Hi", x: 0, y: 0, duration: 1000, time: 0 }]);
 */
export function buildShows(
	shows: notationFormat["shows"],
): ParsedNotationFrame["shows"] {
	return shows.map((show) => {
		const resolvedEffect = resolveTextEffect(show);
		return {
			type: show.type,
			content: show.content,
			effect: resolvedEffect.effect,
			x: show.x,
			y: show.y,
			duration: show.duration,
			time: show.time,
			config: resolvedEffect.config,
		};
	});
}

/**
 * 逐帧生成解析后的谱面数据。
 * @param notation 原始谱面数据。
 * @returns 生成器，按帧输出 ParsedNotationFrame。
 */
/**
 * 逐帧生成解析后的谱面数据。
 * @param notation 原始谱面数据。
 * @returns 生成器，按帧输出 ParsedNotationFrame。
 * @example
 * const frameIterator = parseNotation(notation);
 * const frame = frameIterator.next().value;
 */
export function* parseNotation(
	notation: notationFormat,
): Generator<ParsedNotationFrame, void, unknown> {
	const frameDuration = getFrameDuration();
	const frameCount = getFrameCount(
		notation,
		frameDuration,
	);
	const trackEntries = getTrackEntries(notation);

	for (let index = 0; index < frameCount; index += 1) {
		const currentTime = index * frameDuration;
		const notes = buildNotes(
			trackEntries,
			currentTime,
			frameDuration,
		);
		const shows = buildShows(notation.shows);

		yield {
			time: currentTime,
			notes,
			shows,
		};
	}
}
