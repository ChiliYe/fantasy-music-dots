/** @format */

import { useEffect, useRef } from "react";
import "../general/pattern/circle";
import { circleBrush } from "../general/pattern/circle";

export default function CanvasTest() {
	const canvasRef = useRef<HTMLCanvasElement | null>(
		null,
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		circleBrush(ctx, {
			x: 250,
			y: 250,
			radius: 50,
			color: [255, 0, 0],
		});
		ctx.stroke();
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
