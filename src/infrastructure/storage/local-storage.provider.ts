import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
	SaveFileInput,
	StorageProvider,
	StoredFile,
} from "@/domain/providers/storage.provider";
import { env } from "@/shared/config/env";

export class LocalStorageProvider implements StorageProvider {
	constructor(
		private readonly uploadDir = path.resolve(env.UPLOAD_DIR),
		private readonly publicPrefix = "/uploads",
	) {}

	async saveFile(input: SaveFileInput): Promise<StoredFile> {
		const key = `${randomUUID()}${path.extname(input.filename)}`;

		await mkdir(this.uploadDir, { recursive: true });
		await writeFile(path.join(this.uploadDir, key), input.data);

		return { key, url: `${this.publicPrefix}/${key}` };
	}

	async deleteFile(key: string): Promise<void> {
		await rm(path.join(this.uploadDir, key), { force: true });
	}
}
