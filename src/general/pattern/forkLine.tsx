/** @format */

import { setColor } from "../function/setColor";
/*
分支线效果

从锚点出发，沿着参考直线的方向，分别向右上和右下各偏 45°，绘制两条分支线。
*/

/**
 * 绘制分支线
 * @param ctx 绘制上下文
 * @param config 配置
 */
export function forkLineBrush(
	ctx: CanvasRenderingContext2D,
	config: {
		/** 参考直线的起点 */
		start: { x: number; y: number };
		/** 参考直线的终点 */
		end: { x: number; y: number };
		/** 选在线段上的锚点，分支从这里发出 */
		point: { x: number; y: number };
		/** 分支长度 */
		length: number;
		color?: string;
	},
) {
	ctx.save();
	ctx.beginPath();
	setColor(ctx, config.color);

	const { start, end, point, length } = config;
	const angle = Math.atan2(
		end.y - start.y,
		end.x - start.x,
	);

	// 以参考直线方向为基准，分别向右上和右下各偏 45°
	const branchA = {
		x: point.x + length * Math.cos(angle - Math.PI / 4),
		y: point.y + length * Math.sin(angle - Math.PI / 4),
	};
	const branchB = {
		x: point.x + length * Math.cos(angle + Math.PI / 4),
		y: point.y + length * Math.sin(angle + Math.PI / 4),
	};

	// 绘制参考直线（不需要）
	// ctx.moveTo(start.x, start.y);
	// ctx.lineTo(end.x, end.y);

	// 绘制从锚点发出的两条分支
	ctx.moveTo(point.x, point.y);
	ctx.lineTo(branchA.x, branchA.y);
	ctx.moveTo(point.x, point.y);
	ctx.lineTo(branchB.x, branchB.y);

	ctx.closePath();
	// ctx.reset();
	// ctx.fillStyle = config.color ?? "#000000";
	ctx.stroke();

	// ctx.beginPath();
	// ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
	// ctx.fill();
	ctx.restore();
}
