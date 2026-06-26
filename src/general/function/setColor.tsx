/** @format */

export function setColor(
	ctx: CanvasRenderingContext2D,
	color: string | [number, number, number] | undefined,
) {
	if (typeof color === "string") {
		ctx.strokeStyle = color;
		console.log(ctx.strokeStyle);
	} else if (Array.isArray(color)) {
		ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
		console.log(ctx.strokeStyle);
	}
}
