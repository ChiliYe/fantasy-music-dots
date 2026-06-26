/** @format */

import { useEffect, useRef } from "react";
import "../general/pattern/circle";
import { verticalLineBrush } from "../general/pattern/verticalLine‌";

export default function CanvasTest() {
	const canvasRef = useRef<HTMLCanvasElement | null>(
		null,
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.beginPath();
		ctx.moveTo(50, 50);
		ctx.lineTo(150, 50);
		ctx.closePath();
		ctx.stroke();

		verticalLineBrush(ctx, {
			x: 100,
			y: 50,
			length: 100,
			vxs: 50,
			vxe: 150,
			vys: 50,
			vye: 50,
			color: [0, 0, 255],
		});
	}, []);

	return (
		<div>
			<canvas
				ref={canvasRef}
				id="canvas"
				width={500}
				height={500}
			></canvas>
		</div>
	);
}
