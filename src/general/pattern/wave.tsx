/**
 * 波浪线画笔
 *
 * 从指定锚点出发，沿着给定方向向量绘制一段正弦波浪线。
 *
 * @format
 * @param ctx 画布上下文
 * @param config 配置对象，包含锚点、方向向量、长度和样式
 * @example
 * const canvas = document.getElementById("canvas") as HTMLCanvasElement;
 * const ctx = canvas.getContext("2d")!;
 * waveBrush(ctx, {
 *   x: 100,
 *   y: 100,
 *   directionX: 1,
 *   directionY: 0,
 *   length: 80,
 *   color: "#ffffff",
 * });
 */

export function waveBrush(
	ctx: CanvasRenderingContext2D,
	config: {
		x: number;
		y: number;
		directionX: number;
		directionY: number;
		length: number;
		color: string;
		amplitude?: number;
		wavelength?: number;
		steps?: number;
		lineWidth?: number;
	},
) {
	ctx.save();
	ctx.strokeStyle = config.color;
	ctx.lineWidth = config.lineWidth ?? 2;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";

	const trackLength =
		Math.hypot(config.directionX, config.directionY) ||
		1;
	const unitX = config.directionX / trackLength;
	const unitY = config.directionY / trackLength;
	const normalX = -unitY;
	const normalY = unitX;
	const amplitude = config.amplitude ?? 5;
	const wavelength = config.wavelength ?? 10;
	const steps = config.steps ?? 90;
	const cycles = config.length / Math.max(wavelength, 1);

	ctx.beginPath();
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const offsetAlongTrack = t * config.length;
		const x = config.x + unitX * offsetAlongTrack;
		const y = config.y + unitY * offsetAlongTrack;
		const waveOffset =
			Math.sin(t * Math.PI * 2 * cycles) * amplitude;
		const pointX = x + normalX * waveOffset;
		const pointY = y + normalY * waveOffset;

		if (i === 0) {
			ctx.moveTo(pointX, pointY);
		} else {
			ctx.lineTo(pointX, pointY);
		}
	}

	ctx.stroke();
	ctx.restore();
}
