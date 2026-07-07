/**
 * 记谱解析入口文件。
 *
 * 当前文件仅负责向外暴露解析方法，核心逻辑仍保留在方法模块中，
 * 这样可以把公共能力和外部接口解耦。
 *
 * @format
 * @example
 * const iterator = parseNotation(notation);
 * const nextFrame = iterator.next().value;
 */

export * from "./method/notationMethods";
