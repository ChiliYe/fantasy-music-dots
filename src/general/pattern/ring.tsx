/** @format */

import "../frameLoader/frameLoader";
import { setColor } from "../function/setColor";
// import { Stack } from "../stl/stack";

/**
 * 圆环画笔
 * @param ctx 画布上下文
 * @param config 配置对象，包含x、y坐标和半径
 * @example
 * const canvas = document.getElementById("canvas") as HTMLCanvasElement;
 * const ctx = canvas.getContext("2d")!;
 * ringBrush(ctx, { x: 50, y: 50, radius: 20 });
 */
export function ringBrush(
	ctx: CanvasRenderingContext2D,
	config: {
		x: number;
		y: number;
		radius: number;
		color?: string | [number, number, number];
	},
) {
	ctx.save();
	ctx.beginPath();
	setColor(ctx, config.color);
	ctx.arc(
		config.x,
		config.y,
		config.radius,
		0,
		Math.PI * 2,
	);
	ctx.closePath();
	ctx.stroke();
	ctx.restore();
}
