/** @format */

/**
 * 可用于帧动画的数值迭代器。
 */
export type NumberIterator = Iterator<number> & {
	current: number;
};

/**
 * 创建一个从起点平滑推进到终点的数值迭代器。
 * @param start 起始值。
 * @param end 结束值。
 * @param counts 迭代次数。
 * @returns 可连续取值的数值迭代器。
 */
export function createNumberIterator(
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
 * 根据迭代器或固定值，计算当前的过渡数值。
 * @param iterator 过渡迭代器或直接给定的数值。
 * @param defaultValue 未提供迭代器时的默认值。
 * @returns 当前应使用的数值。
 */
export function resolveNumberTransition(
	iterator: NumberIterator | number | undefined,
	defaultValue: number,
): number {
	if (typeof iterator === "number") {
		return iterator;
	}
	if (iterator && typeof iterator.next === "function") {
		iterator.next();
		return iterator.current;
	}
	return defaultValue;
}
