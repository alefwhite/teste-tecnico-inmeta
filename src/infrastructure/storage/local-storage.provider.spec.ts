import { randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { LocalStorageProvider } from "./local-storage.provider";

describe("LocalStorageProvider", () => {
	const uploadDir = path.join(tmpdir(), `inmeta-storage-spec-${randomUUID()}`);
	const provider = new LocalStorageProvider(uploadDir);

	afterAll(async () => {
		await rm(uploadDir, { recursive: true, force: true });
	});

	it("saves a file to disk and returns key and url", async () => {
		const stored = await provider.saveFile({
			filename: "rg.pdf",
			mimetype: "application/pdf",
			data: Buffer.from("pdf-content"),
		});

		expect(stored.key).toMatch(/\.pdf$/);
		expect(stored.url).toBe(`/uploads/${stored.key}`);

		const content = await readFile(path.join(uploadDir, stored.key));
		expect(content.toString()).toBe("pdf-content");
	});

	it("deletes a previously saved file", async () => {
		const stored = await provider.saveFile({
			filename: "cpf.pdf",
			mimetype: "application/pdf",
			data: Buffer.from("cpf-content"),
		});

		await provider.deleteFile(stored.key);

		await expect(readFile(path.join(uploadDir, stored.key))).rejects.toThrow();
	});
});
