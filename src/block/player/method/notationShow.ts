/** @format */

import type { ParsedNotationFrame } from "./notationTypes";

/**
 * 将文本演出对象映射为统一的效果描述。
 * @param show 原始演出对象。
 * @returns 包含效果名与配置项的对象。
 * @example
 * const result = resolveTextEffect({ type: "text", content: "Hello", x: 0, y: 0, duration: 1000, time: 0 });
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
 * 将原始演出列表转换为播放器可消费的演出数组。
 * @param shows 原始演出列表。
 * @returns 统一格式的演出数组。
 * @example
 * const currentShows = buildShows([{ type: "text", content: "Go", x: 0, y: 0, duration: 1000, time: 0 }]);
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
