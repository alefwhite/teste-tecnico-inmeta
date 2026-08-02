import * as crypto from "node:crypto";

export interface DocumentVersionAttributes {
	id: string;
	documentId: string;
	versionNumber: number;
	fileName: string;
	fileSize: number;
	mimeType: string;
	storageKey: string;
	storageUrl: string;
	createdAt: Date;
}

export interface CreateDocumentVersionDTO {
	documentId: string;
	versionNumber: number;
	fileName: string;
	fileSize: number;
	mimeType: string;
	storageKey: string;
	storageUrl: string;
}

export class DocumentVersion {
	id: string;
	documentId: string;
	versionNumber: number;
	fileName: string;
	fileSize: number;
	mimeType: string;
	storageKey: string;
	storageUrl: string;
	createdAt: Date;

	constructor(attributes: DocumentVersionAttributes) {
		this.id = attributes.id;
		this.documentId = attributes.documentId;
		this.versionNumber = attributes.versionNumber;
		this.fileName = attributes.fileName;
		this.fileSize = attributes.fileSize;
		this.mimeType = attributes.mimeType;
		this.storageKey = attributes.storageKey;
		this.storageUrl = attributes.storageUrl;
		this.createdAt = attributes.createdAt;
	}

	static create(data: CreateDocumentVersionDTO): DocumentVersion {
		return new DocumentVersion({
			id: crypto.randomUUID(),
			documentId: data.documentId,
			versionNumber: data.versionNumber,
			fileName: data.fileName,
			fileSize: data.fileSize,
			mimeType: data.mimeType,
			storageKey: data.storageKey,
			storageUrl: data.storageUrl,
			createdAt: new Date(),
		});
	}
}
