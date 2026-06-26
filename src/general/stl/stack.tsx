/** @format */

export class Stack<T> {
	private items: T[] = [];

	constructor(items: T[] = []) {
		this.items = items;
	}

	/**
	 * 入栈
	 * @param item 要入栈的元素
	 * @example
	 * const stack = new Stack<number>();
	 * stack.push(1);
	 */
	push(item: T): void {
		this.items.push(item);
	}

	/**
	 * 出栈
	 * @returns 栈顶元素，如果栈为空则返回 undefined
	 * @example
	 * const stack = new Stack<number>();
	 * stack.push(1);
	 * const item = stack.pop();
	 */
	pop(): typeof this.items.length extends 0
		? undefined
		: T {
		return this.items.pop()!;
	}

	/**
	 * 查看栈顶元素
	 * @returns 栈顶元素，如果栈为空则返回 undefined
	 * @example
	 * const stack = new Stack<number>();
	 * stack.push(1);
	 * const item = stack.peek();
	 */
	top(): typeof this.items.length extends 0
		? undefined
		: T {
		return this.items[this.items.length - 1];
	}

	/**
	 * 栈大小
	 * @returns 栈中元素的数量
	 */
	size(): number {
		return this.items.length;
	}

	isEmpty(): boolean {
		return this.size() === 0;
	}
}
