/** @format */

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

export function resolveDefaultNoteColor(
	color: string,
): string | null {
	return DEFAULT_NOTE_COLOR_MAP[color] ?? null;
}

export function getDefaultNoteRadius(): number {
	return DEFAULT_NOTE_RADIUS;
}

export function getDefaultHoldLength(): number {
	return DEFAULT_HOLD_LINE_LENGTH;
}

export function getDefaultDragLineLength(): number {
	return DEFAULT_DRAG_LINE_LENGTH;
}

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
