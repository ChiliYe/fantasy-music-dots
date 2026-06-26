/** @format */

/**
 * 通用处理对象类型。
 */
export type HandlerObject = Record<string, unknown>;

/**
 * 帧处理函数类型，接受画布上下文和当前配置对象。
 */
export type FrameHandler<
	T extends HandlerObject = HandlerObject,
> = (ctx: CanvasRenderingContext2D, config: T) => void;

export type FrameTask<
	T extends HandlerObject = HandlerObject,
> = {
	config: T;
	handler: FrameHandler<T>;
};

export interface FrameLoaderConfig {
	/**x坐标 */ x: Iterator<number>;
	/**y坐标 */ y: Iterator<number>;
	/**透明度 */ alpha: Iterator<number>;
	//其他属性后续补充，为了类型安全不做预留
}
