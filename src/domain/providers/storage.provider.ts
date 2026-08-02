export interface StoredFile {
	key: string;
	url: string;
}

export interface SaveFileInput {
	filename: string;
	mimetype: string;
	data: Buffer;
}

export interface StorageProvider {
	saveFile(input: SaveFileInput): Promise<StoredFile>;
	deleteFile(key: string): Promise<void>;
}
