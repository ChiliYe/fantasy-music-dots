/** @format */

export class Queue<T> {
	private items: T[] = [];

	constructor(items: T[] = []) {
		this.items = items;
	}

	/**
	 * 入队
	 * @param item 要入队的元素
	 */
	push(item: T) {
		this.items.push(item);
	}

	/**
	 * 出队
	 * @returns 返回出队的元素
	 */
	pop() {
		return this.items.shift();
	}

	/**
	 * 查看队列是否为空
	 * @returns 如果队列为空则返回 true，否则返回 false
	 */
	isEmpty() {
		return this.size() === 0;
	}

	/**
	 * 查看队列大小
	 * @returns 返回队列的大小
	 */
	size() {
		return this.items.length;
	}

	/**
	 * 访问队首元素
	 * @returns 返回队首元素
	 */
	front() {
		return this.items[0];
	}

	/**
	 * 访问队尾元素
	 * @returns 返回队尾元素
	 */
	back() {
		return this.items[this.items.length - 1];
	}
}
