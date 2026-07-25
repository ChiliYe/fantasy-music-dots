/** @format */

import { describe, expect, it } from "vitest";
import {
	buildWavePoints,
	parseNotation,
} from "./notationPlay";

describe("parseNotation", () => {
	it("buildWavePoints should follow the track direction", () => {
		const points = buildWavePoints(
			0,
			0,
			1,
			0,
			100,
			8,
			20,
		);

		expect(points[0].x).toBe(0);
		expect(points[0].y).toBeCloseTo(0, 10);
		expect(points.at(-1)?.x).toBe(100);
		expect(points.at(-1)?.y).toBeCloseTo(0, 10);
		expect(points.some((point) => point.y !== 0)).toBe(
			true,
		);
		expect(
			points.every(
				(point, index) =>
					index === 0 ||
					point.x >= points[index - 1].x,
			),
		).toBe(true);
	});

	it("should generate frames and convert shows into text effects", () => {
		(
			globalThis as typeof globalThis & {
				__notationFrameRate?: number;
			}
		).__notationFrameRate = 120;

		const notation: notationFormat = {
			v: "1.0",
			meta: {
				noter: "test",
				painter: "test",
				composer: "test",
				offset: 0,
				notesNum: 1,
				bpm: 120,
			},
			track: {
				red: null,
				blue: null,
				yellow: null,
				green: null,
				purple: {
					key: 1,
					eventLayers: [
						{
							alphaEvents: [
								{
									easingLeft: 0,
									easingRight: 1,
									easingType: 1,
									end: 255,
									endTime: [1, 0, 1],
									start: 255,
									startTime: [0, 0, 1],
								},
							],
						},
					],
				},
			},
			shows: [
				{
					type: "0",
					content: "hello",
					time: 0,
					duration: 100,
					x: 10,
					y: 20,
				},
			],
		};

		const frames = Array.from(parseNotation(notation));

		expect(frames.length).toBeGreaterThan(0);
		expect(frames[0].notes).toHaveLength(1);
		expect(frames[0].notes[0].key).toBe(1);
		expect(frames[0].shows[0].effect).toBe("fadeIn");
		expect(frames[0].shows[0].content).toBe("hello");
	});
});
