/** @format */

/**
 * 管道中第一个函数的类型，接受一组初始参数并返回结果。
 */
export type PipeStartFunction<
	Args extends unknown[],
	Out,
> = (...args: Args) => Out;

/**
 * 管道中后续函数的类型，接受上一个函数返回值作为第一个参数并返回结果。
 */
export type PipeNextFunction<In, Out> = (value: In) => Out;

/**
 * 函数管道类。
 *
 * 通过 add() 向管道中添加函数，executeFirst() 执行第一个函数，executeAll() 执行整个管道。
 * 上一个函数的返回值会作为下一个函数的第一个参数。
 */
export class FunctionPipe<
	Args extends unknown[] = unknown[],
> {
	private functions: Array<
		| PipeStartFunction<Args, unknown>
		| PipeNextFunction<unknown, unknown>
	> = [];

	/**
	 * 向管道中添加第一个函数或后续函数。
	 *
	 * @param fn 要加入管道的函数
	 */
	add<Out>(fn: PipeStartFunction<Args, Out>): void;
	add<In, Out>(fn: PipeNextFunction<In, Out>): void;
	add(
		fn:
			| PipeStartFunction<Args, unknown>
			| PipeNextFunction<unknown, unknown>,
	) {
		this.functions.push(fn);
	}

	/**
	 * 执行管道中的第一个函数。
	 *
	 * @param args 第一个函数的参数列表
	 * @returns 第一个函数的返回值，如果管道为空则返回 undefined
	 */
	executeFirst<Out = unknown>(
		...args: Args
	): Out | undefined {
		const first = this.functions[0];
		if (!first) {
			return undefined;
		}

		return (first as PipeStartFunction<Args, Out>)(
			...args,
		);
	}

	/**
	 * 顺序执行管道内所有函数。
	 *
	 * 第一个函数使用传入参数执行，后续函数使用上一个函数的返回值作为第一个参数。
	 * @param args 第一个函数的参数列表
	 * @returns 最后一个函数的返回值，如果管道为空则返回 undefined
	 */
	executeAll<Out = unknown>(
		...args: Args
	): Out | undefined {
		if (this.functions.length === 0) {
			return undefined;
		}

		let result: unknown = (
			this.functions[0] as PipeStartFunction<
				Args,
				unknown
			>
		)(...args);

		for (let i = 1; i < this.functions.length; i++) {
			const fn = this.functions[
				i
			] as PipeNextFunction<unknown, unknown>;
			result = fn(result as unknown);
		}

		return result as Out;
	}
}
