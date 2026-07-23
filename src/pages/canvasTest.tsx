/** @format */

import { useEffect, useRef } from "react";
// import PlayerShow from "../block/player/show";
// import { parseNotation } from "../block/player/notationPlay";

export default function CanvasTest() {
	const canvasRef = useRef<HTMLCanvasElement | null>(
		null,
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		(
			globalThis as typeof globalThis & {
				__notationFrameRate?: number;
			}
		).__notationFrameRate = 60;

		// 测试 note 的绘制
		import("../block/player/notationPlay").then(
			(module) => {
				module.drawTailNote(
					ctx,
					"#00ff00",
					220,
					260,
					100,
					260,
					400,
					260,
				);
				module.drawTapNote(
					ctx,
					"#ff0000",
					270,
					280,
				);
				module.drawDragNote(
					ctx,
					"#0000ff",
					290,
					360,
					100,
					260,
					400,
					260,
				);
			},
		);

		// const notationSample: notationFormat = {
		// 	v: "1.0",
		// 	meta: {
		// 		noter: "demo",
		// 		painter: "demo",
		// 		composer: "demo",
		// 		offset: 0,
		// 		notesNum: 2,
		// 		bpm: 120,
		// 	},
		// 	track: {
		// 		red: {
		// 			key: 2,
		// 			eventLayers: [
		// 				{
		// 					alphaEvents: [
		// 						{
		// 							easingLeft: 0,
		// 							easingRight: 1,
		// 							easingType: 1,
		// 							end: 255,
		// 							endTime: [1, 0, 1],
		// 							start: 255,
		// 							startTime: [0, 0, 1],
		// 						},
		// 					],
		// 				},
		// 			],
		// 		},
		// 		blue: null,
		// 		yellow: null,
		// 		green: null,
		// 		purple: null,
		// 	},
		// 	shows: [
		// 		{
		// 			type: "text",
		// 			content: "Hello Demo",
		// 			time: 0,
		// 			duration: 120,
		// 			x: 120,
		// 			y: 220,
		// 		},
		// 	],
		// };

		// const stopPlayback = PlayerShow(
		// 	ctx,
		// 	parseNotation(notationSample),
		// );

		// return () => stopPlayback();
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
