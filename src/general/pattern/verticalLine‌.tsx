/**
 * 垂线段画笔
 *
 * @format
 * @param ctx 画布上下文
 * @param config 配置对象，包含x、y坐标和高度
 * @example const canvas = document.getElementById("canvas") as HTMLCanvasElement; const ctx = canvas.getContext("2d")!;
 */

import {
	getPathEndPoint,
	getSegmentDirection,
} from "../function/segmentDirection";
import { setColor } from "../function/setColor";

export function verticalLineBrush(
	ctx: CanvasRenderingContext2D,
	config: {
		/**中点x坐标*/ x: number;
		/**中点y坐标*/ y: number;
		/**线长 */ length: number;
		/**原线段开始x坐标*/ vxs: number;
		/**原线段结束x坐标*/ vxe: number;
		/**原线段开始y坐标*/ vys: number;
		/**原线段结束y坐标*/ vye: number;
		/**颜色*/ color?: string | [number, number, number];
	},
) {
	ctx.restore();
	ctx.beginPath();
	setColor(ctx, config.color);
	const duration = getSegmentDirection({
		startX: config.vxs,
		startY: config.vys,
		endX: config.vxe,
		endY: config.vye,
	});
	const halfLength = config.length / 2;
	const { x: startX, y: startY } = getPathEndPoint(
		{
			startX: config.x,
			startY: config.y,
			endX: duration.dx,
			endY: duration.dy,
		},
		-halfLength,
	);
	const { x: endX, y: endY } = getPathEndPoint(
		{
			startX: config.x,
			startY: config.y,
			endX: duration.dx,
			endY: duration.dy,
		},
		halfLength,
	);
	ctx.moveTo(startX, startY);
	ctx.lineTo(endX, endY);
	ctx.closePath();
	ctx.reset();
	ctx.stroke();
}
