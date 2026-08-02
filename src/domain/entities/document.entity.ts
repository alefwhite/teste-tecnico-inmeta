import * as crypto from "node:crypto";

export interface DocumentAttributes {
	id: string;
	collaboratorId: string;
	documentTypeId: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
}

export interface CreateDocumentDTO {
	collaboratorId: string;
	documentTypeId: string;
}

export class Document {
	id: string;
	collaboratorId: string;
	documentTypeId: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;

	constructor(attributes: DocumentAttributes) {
		this.id = attributes.id;
		this.collaboratorId = attributes.collaboratorId;
		this.documentTypeId = attributes.documentTypeId;
		this.createdAt = attributes.createdAt;
		this.updatedAt = attributes.updatedAt;
		this.deletedAt = attributes.deletedAt;
	}

	static create(data: CreateDocumentDTO): Document {
		return new Document({
			id: crypto.randomUUID(),
			collaboratorId: data.collaboratorId,
			documentTypeId: data.documentTypeId,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		});
	}

	softDelete(): void {
		this.deletedAt = new Date();
	}
}
