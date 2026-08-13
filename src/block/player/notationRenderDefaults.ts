/** @format */

// 这一模块只负责提供默认的渲染样式和轨道几何参数，避免渲染逻辑硬编码具体值。

export const DEFAULT_NOTE_COLOR_MAP: Record<
	string,
	string
> = {
	red: "#ea1b1b",
	blue: "#2c84cd",
	yellow: "#e0b725",
	green: "#69db7c",
	purple: "#b097fc",
};

export const DEFAULT_NOTE_RADIUS = 5;
export const DEFAULT_HOLD_LINE_LENGTH = 40;
export const DEFAULT_DRAG_LINE_LENGTH = 20;
export const DEFAULT_TAIL_POINT_LENGTH = 8;
export const DEFAULT_SHOW_FONT = "20px sans-serif";
export const DEFAULT_SHOW_FILL_STYLE = "#f8f9fa";
export const DEFAULT_BACKGROUND_FILL_STYLE = "#111827";

const DEFAULT_TRACK_GEOMETRY: Record<
	string,
	{
		startX: number;
		startY: number;
		endX: number;
		endY: number;
	}
> = {
	red: { startX: 80, startY: 100, endX: 80, endY: 220 },
	blue: {
		startX: 160,
		startY: 100,
		endX: 160,
		endY: 220,
	},
	yellow: {
		startX: 240,
		startY: 100,
		endX: 240,
		endY: 220,
	},
	green: {
		startX: 320,
		startY: 100,
		endX: 320,
		endY: 220,
	},
	purple: {
		startX: 400,
		startY: 100,
		endX: 400,
		endY: 220,
	},
};

// 通过颜色枚举拿到对应的渲染色值，未命中时返回 null 交给调用方兜底处理。
export function resolveDefaultNoteColor(
	color: string,
): string | null {
	return DEFAULT_NOTE_COLOR_MAP[color] ?? null;
}

// 返回音符圆形半径，统一控制视觉大小。
export function getDefaultNoteRadius(): number {
	return DEFAULT_NOTE_RADIUS;
}

// 返回 hold 线长度，决定长按轨道的视觉延伸长度。
export function getDefaultHoldLength(): number {
	return DEFAULT_HOLD_LINE_LENGTH;
}

// 返回 drag 方向线的默认长度，用于连接滑动路径。
export function getDefaultDragLineLength(): number {
	return DEFAULT_DRAG_LINE_LENGTH;
}

// 返回尾点长度，控制弹尾与分叉线的默认尺寸。
export function getDefaultTailPointLength(): number {
	return DEFAULT_TAIL_POINT_LENGTH;
}

export function getDefaultShowFont(): string {
	return DEFAULT_SHOW_FONT;
}

export function getDefaultShowFillStyle(): string {
	return DEFAULT_SHOW_FILL_STYLE;
}

export function getDefaultBackgroundFillStyle(): string {
	return DEFAULT_BACKGROUND_FILL_STYLE;
}

// 把轨道描述转换成渲染坐标，保证不同颜色轨道使用固定的几何布局。
export function resolveDefaultTrackGeometry(track: {
	color: string;
	layer: unknown;
}) {
	return (
		DEFAULT_TRACK_GEOMETRY[track.color] ?? {
			startX: 250,
			startY: 100,
			endX: 250,
			endY: 220,
		}
	);
}
