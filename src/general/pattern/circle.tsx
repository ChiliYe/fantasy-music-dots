/**
 * 实心圆画笔
 *
 * @format
 * @param ctx 画布上下文
 * @param config 配置对象，包含x、y坐标和半径
 * @example const canvas = document.getElementById("canvas") as HTMLCanvasElement; const ctx = canvas.getContext("2d")!;
 */

export function circleBrush(
	ctx: CanvasRenderingContext2D,
	config: {
		x: number;
		y: number;
		radius: number;
		color: string;
	},
) {
	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = config.color;
	ctx.arc(
		config.x,
		config.y,
		config.radius,
		0,
		Math.PI * 2,
	);
	ctx.fill();
	ctx.restore();
}
