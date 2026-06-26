/** @format */

import "../frameLoader/frameLoader";
// import { Stack } from "../stl/stack";

/**
 * 圆形画笔
 * @param ctx 画布上下文
 * @param config 配置对象，包含x、y坐标和半径
 * @example
 * const canvas = document.getElementById("canvas") as HTMLCanvasElement;
 * const ctx = canvas.getContext("2d")!;
 * circleBrush(ctx, { x: 50, y: 50, radius: 20 });
 */
export function circleBrush(
	ctx: CanvasRenderingContext2D,
	config: {
		x: number;
		y: number;
		radius: number;
		color?: string | [number, number, number];
	},
) {
	ctx.beginPath();
	if (typeof config.color === "string") {
		ctx.strokeStyle = config.color;
		console.log(ctx.strokeStyle);
	} else if (Array.isArray(config.color)) {
		ctx.strokeStyle = `rgb(${config.color[0]}, ${config.color[1]}, ${config.color[2]})`;
		console.log(ctx.strokeStyle);
	}
	ctx.arc(
		config.x,
		config.y,
		config.radius,
		0,
		Math.PI * 2,
	);
	ctx.closePath();
}
