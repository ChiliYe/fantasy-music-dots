/** @format */

import { loadAsync } from "jszip";
import "../type/notation.d.ts";

export default async function loadNotationFromZip(
	zipFile: File,
): Promise<notationType> {
	//拿文件名
	const fileName = zipFile.name.replace(".zip", "");

	const zipInput =
		typeof (
			zipFile as File & {
				arrayBuffer?: () => Promise<ArrayBuffer>;
			}
		).arrayBuffer === "function"
			? await (
					zipFile as File & {
						arrayBuffer: () => Promise<ArrayBuffer>;
					}
				).arrayBuffer()
			: zipFile;

	const zip = await loadAsync(zipInput);
	const notationFile = zip.file(/\.json$/)[0];
	const coverFile = zip.file(
		/cover\.(jpg|jpeg|png|gif)$/,
	)[0];
	const coverExt =
		coverFile.name.match(
			/cover\.(jpg|jpeg|png|gif)$/,
		)?.[1] ?? "png";
	const coverMime =
		coverExt === "jpg" ? "jpeg" : coverExt;

	return {
		name: fileName,
		cover: await coverFile
			.async("base64")
			.then(
				(data) =>
					`data:image/${coverMime};base64,${data}`,
			),
		notationFormat: JSON.parse(
			await notationFile.async("string"),
		),
	};
}
