/**
 * frameLoader调用约定
 * frameLoader用于创建下一帧，接受两个输入
 * 1 画布元素
 * 2 帧生成器生成的迭代器数组
 *
 * 帧生成器frameGenerater，本质上是一个生成器，接受多个参数，用于生成一个迭代器
 * 迭代器接受一个绘制上下文，利用该上下文及生成器内的参数来绘制下一帧
 *
 * @format
 */

import type { FrameTask } from "../type/handler";

type IteratorWithCurrent = Iterator<unknown> & {
	current: unknown;
};

function isIteratorWithCurrent(
	value: unknown,
): value is IteratorWithCurrent {
	return (
		typeof value === "object" &&
		value !== null &&
		typeof (value as Iterator<unknown>).next ===
			"function" &&
		"current" in (value as object)
	);
}

function buildCurrentConfig(
	config: Record<string, unknown>,
) {
	const currentConfig: Record<string, unknown> = {};
	for (const key of Object.keys(config)) {
		const value = config[key];
		if (isIteratorWithCurrent(value)) {
			value.next();
			currentConfig[key] = value.current;
		} else {
			currentConfig[key] = value;
		}
	}
	return currentConfig;
}

/**
 * frameLoader
 * @param canvas 画布元素
 * @param iteratorArray 配置对象和处理函数数组
 * @returns 取消帧加载的函数
 * @example
 * const paintConfig = {};
 * fadeIn(paintConfig);
 * slide(paintConfig, 0, 100, 0, 50, 30);
 * const cancel = frameLoader(canvas, [
 *   {
 *     config: paintConfig,
 *     handler(ctx, config) {
 *       ctx.globalAlpha = config.alpha as number;
 *       ctx.fillRect(config.x as number, config.y as number, 10, 10);
 *     },
 *   },
 * ]);
 * // 停止动画
 * cancel();
 */
export function frameLoader(
	canvas: HTMLCanvasElement,
	iteratorArray: FrameTask[],
): () => void {
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("无法获取画布上下文");
	}

	let running = true;

	function tick() {
		if (!running) return;
		for (let i = 0; i < iteratorArray.length; i++) {
			const task = iteratorArray[i];
			try {
				const currentConfig = buildCurrentConfig(
					task.config,
				);
				task.handler(
					ctx!,
					currentConfig as typeof task.config,
				);
			} catch (e) {
				console.error("frame iterator error:", e);
			}
		}
		requestAnimationFrame(tick);
	}

	const raf = requestAnimationFrame(tick);

	return () => {
		running = false;
		cancelAnimationFrame(raf);
	};
}

/**
 * 帧生成器frameGenerater
 * @param args 生成器参数
 * @returns 迭代器，接受一个绘制上下文，利用该上下文及生成器内的参数来绘制下一帧
 */
export function* frameGenerater(
	args: unknown[],
): Generator<void, () => void, CanvasRenderingContext2D> {
	while (true) {
		const ctx: CanvasRenderingContext2D = yield;
		// 使用ctx和args绘制下一帧
		ctx.clearRect(
			0,
			0,
			ctx.canvas.width,
			ctx.canvas.height,
		);
		console.log("绘制下一帧，参数：", args);
	}
	// unreachable
	// return () => {};
}
