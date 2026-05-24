/** @format */

interface notationMeta {
	/**谱师*/ noter: string;
	/**画师*/ painter: string;
	/**作曲*/ composer: string;
	/**偏移*/ offset: number;
	/**音符数量*/ notesNum: number;
	/**BPM*/ bpm: number;
}

interface notationNoteInfo {
	/**音符类型*/ type: /**tap*/
		0 | /**hold*/ 1 | /**slide*/ 2 | /**tail*/ 3;
	/**音符位置*/ pos: number;
	/**长音符长度*/ length?: number;
}

interface notationTrackInfo {
	red: Array<notationNoteInfo>;
	blue: Array<notationNoteInfo>;
	yellow: Array<notationNoteInfo>;
	green: Array<notationNoteInfo>;
	purple: Array<notationNoteInfo>;
}

interface notationShowInfo {
	/**表演类型 */ type: /**文字*/
		1 | /**图片*/ 2 | /**粒子效果 */ 3;
	/**表演内容 */ content: string;
	/**表演时间 */ time: number;
	/**表演持续时间 */ duration: number;
	/**表演x坐标 */ x: number;
	/**表演y坐标 */ y: number;
}

interface notationFormat {
	/**铺面版本*/ v: "1";
	/**谱面元信息*/ meta: notationMeta;
	/**谱面音轨信息*/ tracks: notationTrackInfo;
	/**表演信息*/ shows: Array<notationShowInfo>;
}

interface notationType {
	/**谱面文件*/ notationFormat: notationFormat;
	/**谱面封面 */ cover: DataURL;
	/**谱面文件名 */ name: string;
}
