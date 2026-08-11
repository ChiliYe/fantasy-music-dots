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
import { createNumberIterator } from "./numberTransition";

/**
 * 为帧加载配置注入平滑移动过渡。
 * @param origin 原始配置对象。
 * @param startX 起始 x 位置。
 * @param endX 结束 x 位置。
 * @param startY 起始 y 位置。
 * @param endY 结束 y 位置。
 * @param counts 过渡帧数。
 * @returns 注入过渡后的配置对象。
 */
export function slide(
	origin: FrameLoaderConfig,
	startX: number = 0,
	endX: number = 1,
	startY: number = 0,
	endY: number = 1,
	counts: number = 30,
): FrameLoaderConfig {
	origin.x = createNumberIterator(startX, endX, counts);
	origin.y = createNumberIterator(startY, endY, counts);

	return origin as FrameLoaderConfig;
}
