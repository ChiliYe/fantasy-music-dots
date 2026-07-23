/** @format */

import { describe, expect, it, vi } from "vitest";
import { forkLineBrush } from "./forkLine";

describe("forkLineBrush", () => {
	it("draws a main line and two 45° branches from the selected point", () => {
		const calls: Array<{
			method: string;
			args: number[];
		}> = [];
		const ctx = {
			save: vi.fn(),
			restore: vi.fn(),
			beginPath: vi.fn(() =>
				calls.push({
					method: "beginPath",
					args: [],
				}),
			),
			moveTo: vi.fn((x: number, y: number) =>
				calls.push({
					method: "moveTo",
					args: [x, y],
				}),
			),
			lineTo: vi.fn((x: number, y: number) =>
				calls.push({
					method: "lineTo",
					args: [x, y],
				}),
			),
			closePath: vi.fn(() =>
				calls.push({
					method: "closePath",
					args: [],
				}),
			),
			stroke: vi.fn(() =>
				calls.push({ method: "stroke", args: [] }),
			),
			arc: vi.fn((x: number, y: number) =>
				calls.push({ method: "arc", args: [x, y] }),
			),
			fill: vi.fn(() =>
				calls.push({ method: "fill", args: [] }),
			),
			reset: vi.fn(),
			strokeStyle: "#ffffff",
		} as unknown as CanvasRenderingContext2D;

		forkLineBrush(ctx, {
			start: { x: 100, y: 200 },
			end: { x: 400, y: 200 },
			point: { x: 220, y: 200 },
			length: 120,
			color: "#ffffff",
		});

		const lineCalls = calls.filter(
			(call) => call.method === "lineTo",
		);
		expect(lineCalls).toHaveLength(3);
		expect(lineCalls[0].args[0]).toBe(400);
		expect(lineCalls[0].args[1]).toBe(200);
		expect(lineCalls[1].args[0]).toBeCloseTo(
			220 + 120 * Math.cos(-Math.PI / 4),
			10,
		);
		expect(lineCalls[1].args[1]).toBeCloseTo(
			200 + 120 * Math.sin(-Math.PI / 4),
			10,
		);
		expect(lineCalls[2].args[0]).toBeCloseTo(
			220 + 120 * Math.cos(Math.PI / 4),
			10,
		);
		expect(lineCalls[2].args[1]).toBeCloseTo(
			200 + 120 * Math.sin(Math.PI / 4),
			10,
		);
	});
});
