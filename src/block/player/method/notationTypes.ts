/** @format */

/**
 * 这一层定义渲染前的规范化数据结构，保证帧生成、播放控制和绘制逻辑都以同一份类型约束工作。
 */

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
// 单个 note 在当前帧中的统一表示，保留原始颜色、轨道与时间信息供渲染器消费。
export interface ParsedNotationNote {
	color: string;
	layer: trackColor;
	key?: notationTrackKeyType;
	track: {
		color: trackColor;
		layer: notationTrackLayer;
	};
	comment: string;
	effect?: ParsedNotationEffect;
	currentTime: number;
}

export type ParsedNotationTrackRef = {
	color: trackColor;
	layer: notationTrackLayer;
};

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
 * 单个轨道在当前帧的状态，包括该帧的音符列表和轨道级信息。
 */
// 轨道级帧快照用于保留某一条轨道在当前时间的全部状态，便于逐轨道渲染。
export interface ParsedNotationTrackFrame {
	color: trackColor;
	key?: notationTrackKeyType;
	currentTime: number;
	track: {
		color: trackColor;
		layer: notationTrackLayer;
	};
	notes: ParsedNotationNote[];
}

/**
 * 表示一次被渲染器消费的完整帧数据。
 * @example
 * const frame = { time: 0, tracks: { red: { notes: [], currentTime: 0 } }, shows: [] };
 */
// 一整帧数据的最终结构，既包含轨道状态，也包含文字演出，以便渲染器一次性消费。
export interface ParsedNotationFrame {
	time: number;
	tracks: Partial<
		Record<trackColor, ParsedNotationTrackFrame | null>
	>;
	shows: ParsedNotationShow[];
}
