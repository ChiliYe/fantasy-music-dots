/**
 * 平滑移动效果
 *
 * @format
 * @param origin 原始配置对象
 * @param startX 初始x，默认为0
 * @param endX 结束x，默认为1
 * @param startY 初始y，默认为0
 * @param endY 结束y，默认为1
 * @param counts 淡入的帧数，默认为30
 */

import type { FrameLoaderConfig } from "../../type/handler";

type NumberIterator = Iterator<number> & {
	current: number;
};

function isNumberIterator(
	value: unknown,
): value is NumberIterator {
	return (
		typeof value === "object" &&
		value !== null &&
		typeof (value as NumberIterator).next === "function"
	);
}

function createNumberIterator(
	start: number,
	end: number,
	counts: number,
): NumberIterator {
	let frame = 0;
	const step = counts === 0 ? 0 : (end - start) / counts;
	const iterator = {
		current: start,
		next() {
			if (frame < counts) {
				iterator.current += step;
				frame += 1;
			} else {
				iterator.current = end;
			}
			return { value: iterator.current, done: false };
		},
	};

	return iterator;
}

/**
 * slide：接受一个状态对象，返回一个帧生成器。
 * 每次生成器接收 `CanvasRenderingContext2D` 时，会确保传入对象的 `x`/`y` 属性为迭代器。
 */
export function slide(
	origin: FrameLoaderConfig,
	startX: number = 0,
	endX: number = 1,
	startY: number = 0,
	endY: number = 1,
	counts: number = 30,
): FrameLoaderConfig {
	if (!isNumberIterator(origin.x)) {
		origin.x = createNumberIterator(
			startX,
			endX,
			counts,
		);
	}
	if (!isNumberIterator(origin.y)) {
		origin.y = createNumberIterator(
			startY,
			endY,
			counts,
		);
	}

	return origin as FrameLoaderConfig;
}
