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
import { createNumberIterator } from "./numberTransition";

/**
 * 为帧加载配置注入淡入过渡。
 * @param origin 原始配置对象。
 * @param start 初始透明度。
 * @param end 结束透明度。
 * @param counts 过渡帧数。
 * @returns 注入过渡后的配置对象。
 */
export function fadeIn(
	origin: FrameLoaderConfig,
	start: number = 0,
	end: number = 1,
	counts: number = 30,
): FrameLoaderConfig {
	origin.alpha = createNumberIterator(start, end, counts);

	return origin as FrameLoaderConfig;
}
