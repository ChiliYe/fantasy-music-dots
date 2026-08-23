/**
 * 二分查找
 *
 * @format
 * @param arr 已排序的数组 (必须根据 compareFn 的规则有序)
 * @param target 目标值
 * @param compareFn 比较函数
 * @returns 目标值在数组中的索引，如果未找到则返回 -1
 */

export function binarySearch<T, TT>(
	arr: T[],
	target: TT,
	compareFn: (a: T, b: TT) => number = (a, b) => {
		if (
			typeof a === "number" &&
			typeof b === "number"
		) {
			return a - b;
		}
		throw new Error(
			"Unsupported types for comparison. Please provide a custom compareFn.",
		);
	},
): number {
	let left = 0;
	let right = arr.length - 1;

	while (left <= right) {
		// 使用 left + (right - left) / 2 防止潜在的数值溢出问题 (虽然在 JS Number 中很少见，但是最佳实践)
		const mid = left + Math.floor((right - left) / 2);

		const comparison = compareFn(arr[mid], target);

		if (comparison === 0) {
			return mid;
		} else if (comparison < 0) {
			// arr[mid] < target，目标在右半部分
			left = mid + 1;
		} else {
			// arr[mid] > target，目标在左半部分
			right = mid - 1;
		}
	}

	return -1;
}
