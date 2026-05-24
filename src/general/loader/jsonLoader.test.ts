/** @format */

import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import loadNotationFromZip from "./jsonLoader";

async function createZipFixture() {
	const zip = new JSZip();

	zip.file(
		"song.json",
		JSON.stringify({
			title: "Test Song",
			tempo: 120,
		}),
	);

	zip.file(
		"cover.png",
		Buffer.from(
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w==",
			"base64",
		),
	);

	const blob = await zip.generateAsync({ type: "blob" });

	return Object.assign(blob, {
		name: "demo.zip",
	}) as File;
}

describe("loadNotationFromZip", () => {
	it("should load notation JSON and cover image from a zip file", async () => {
		const zipFile = await createZipFixture();

		const notation = await loadNotationFromZip(zipFile);

		expect(notation.name).toBe("demo");
		expect(notation.notationFormat).toEqual({
			title: "Test Song",
			tempo: 120,
		});
		expect(notation.cover).toContain(
			"data:image/png;base64,",
		);
	});
});
