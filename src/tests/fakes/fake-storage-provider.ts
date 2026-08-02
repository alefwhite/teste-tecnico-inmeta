import type {
	SaveFileInput,
	StorageProvider,
	StoredFile,
} from "@/domain/providers/storage.provider";

export class FakeStorageProvider implements StorageProvider {
	saved: SaveFileInput[] = [];
	deleted: string[] = [];

	async saveFile(input: SaveFileInput): Promise<StoredFile> {
		this.saved.push(input);
		return {
			key: `fake/${input.filename}`,
			url: `/uploads/fake/${input.filename}`,
		};
	}

	async deleteFile(key: string): Promise<void> {
		this.deleted.push(key);
	}
}
