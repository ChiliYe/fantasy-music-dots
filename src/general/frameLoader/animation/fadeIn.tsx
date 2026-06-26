/**
 * 淡入效果
 *
 * @format
 * @param handler 用于绘制的函数，接受一个绘制上下文，和若干个参数,利用该上下文来绘制下一帧
 * @param start 初始透明度，默认为0
 * @param end 结束透明度，默认为1
 * @param counts 淡入的帧数，默认为30
 * @see frameLoader
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
 * fadeIn：接受一个状态对象，返回一个帧生成器。
 * 每次生成器接收 `CanvasRenderingContext2D` 时，会确保传入对象的 `alpha` 属性为迭代器。
 */
export function fadeIn(
	origin: FrameLoaderConfig,
	start: number = 0,
	end: number = 1,
	counts: number = 30,
): FrameLoaderConfig {
	if (!isNumberIterator(origin.alpha)) {
		origin.alpha = createNumberIterator(
			start,
			end,
			counts,
		);
	}

	return origin as FrameLoaderConfig;
}
