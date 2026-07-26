/** @format */

interface notationMeta {
	/**谱师*/ noter: string;
	/**画师*/ painter: string;
	/**作曲*/ composer: string;
	/**偏移*/ offset: number;
	/**音符数量*/ notesNum: number;
	/**BPM*/ bpm: number;
}

interface notationEventTime {
	0: number;
	1: number;
	2: number;
}

interface notationEvent {
	/**缓动左边界*/ easingLeft: number;
	/**缓动右边界*/ easingRight: number;
	/**缓动类型*/ easingType: number;
	/**结束值*/ end: number;
	/**结束时间*/ endTime: [number, number, number];
	/**开始值*/ start: number;
	/**开始时间*/ startTime: [number, number, number];
	/**事件关联组*/ linkgroup?: number;
}

interface notationEventLayer {
	alphaEvents?: Array<notationEvent>;
	moveXEvents?: Array<notationEvent>;
	moveYEvents?: Array<notationEvent>;
	rotateEvents?: Array<notationEvent>;
	speedEvents?: Array<notationEvent>;
}

/** 音轨键位类型。
 * 1：点键
 * 2：触键
 * 3：长弦
 * 4：尾点
 */
type notationTrackKeyType = 1 | 2 | 3 | 4;

type trackColor =
	| "red"
	| "blue"
	| "green"
	| "yellow"
	| "purple";

/**单个note */
interface notationNoteInfo {
	/**类型 */ type: notationTrackKeyType;
	/**节拍数[小节,拍,拍内] */ beat: [
		number,
		number,
		number,
	];
	/**长度 */ length: number;
}

interface notationTrackLayer {
	/**事件图层*/ eventLayers: Array<notationEventLayer>;
	/**note数组 */ notes: Array<notationNoteInfo>;
}

interface notationTrackInfo {
	red: notationTrackLayer | null;
	blue: notationTrackLayer | null;
	yellow: notationTrackLayer | null;
	green: notationTrackLayer | null;
	purple: notationTrackLayer | null;
}

interface notationShowInfo {
	/**表演类型*/ type: /**文本*/ "text";
	/**表演内容*/ content: string;
	/**表演时间*/ time: number;
	/**表演持续时间*/ duration: number;
	/**表演x坐标*/ x: number;
	/**表演y坐标*/ y: number;
}

interface notationFormat {
	/**谱面版本*/ v: string;
	/**谱面元信息*/ meta: notationMeta;
	/**谱面音轨信息*/ track: notationTrackInfo;
	/**表演信息*/ shows: Array<notationShowInfo>;
}

interface notationType {
	/**谱面文件*/ notationFormat: notationFormat;
	/**谱面封面*/ cover: DataURL;
	/**谱面文件名*/ name: string;
}
