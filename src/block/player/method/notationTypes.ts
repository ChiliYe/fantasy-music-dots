/** @format */

/**
 * 表示一个演出效果的基础信息。
 * @example
 * const effect = { type: "fadeIn", startTime: 0, duration: 500 };
 */
export interface ParsedNotationEffect {
	type: string;
	startTime: number;
	duration: number;
}

/**
 * 表示当前帧中的一个音符节点。
 * @example
 * const note = { color: "red", layer: "1", comment: "hit" };
 */
export interface ParsedNotationNote {
	color: string;
	layer: string;
	key?: notationTrackKeyType;
	comment: string;
	effect?: ParsedNotationEffect;
}

/**
 * 表示当前帧中的一个文字演出节点。
 * @example
 * const show = { type: "text", content: "Hello", effect: "fadeIn", x: 0, y: 0, duration: 1000, time: 0, config: {} };
 */
export interface ParsedNotationShow {
	type: string;
	content: string;
	effect: string;
	x: number;
	y: number;
	duration: number;
	time: number;
	config: Record<string, number | string>;
}

/**
 * 表示一次被渲染器消费的完整帧数据。
 * @example
 * const frame = { time: 0, notes: [], shows: [] };
 */
export interface ParsedNotationFrame {
	time: number;
	notes: ParsedNotationNote[];
	shows: ParsedNotationShow[];
}
