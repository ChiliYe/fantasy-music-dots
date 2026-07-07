/** @format */

/**
 * 读取谱面播放的目标帧率，优先使用全局变量，其次使用环境变量。
 * @returns 当前使用的帧率。
 * @example
 * const fps = getNotationFrameRate();
 * console.log(fps);
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
 * @example
 * const duration = getFrameDuration(60);
 * console.log(duration);
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
 * @example
 * const totalTime = getTotalNotationTime(notation);
 * console.log(totalTime);
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
 * @example
 * const frameCount = getFrameCount(notation, 16.67);
 * console.log(frameCount);
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
 * @example
 * const tracks = getTrackEntries(notation);
 * console.log(tracks[0]);
 */
export function getTrackEntries(
	notation: notationFormat,
): Array<[string, notationTrackLayer]> {
	return Object.entries(notation.track ?? {}).filter(
		([, layer]) => layer !== null,
	) as Array<[string, notationTrackLayer]>;
}
