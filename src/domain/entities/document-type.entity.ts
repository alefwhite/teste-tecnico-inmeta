import * as crypto from "node:crypto";

export interface DocumentTypeAttributes {
	id: string;
	name: string;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
}

export interface CreateDocumentTypeDTO {
	name: string;
	description?: string | null;
}

export interface UpdateDocumentTypeDTO {
	name?: string;
	description?: string | null;
}

export class DocumentType {
	id: string;
	name: string;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;

	constructor(attributes: DocumentTypeAttributes) {
		this.id = attributes.id;
		this.name = attributes.name;
		this.description = attributes.description;
		this.createdAt = attributes.createdAt;
		this.updatedAt = attributes.updatedAt;
		this.deletedAt = attributes.deletedAt;
	}

	static create(data: CreateDocumentTypeDTO): DocumentType {
		return new DocumentType({
			id: crypto.randomUUID(),
			name: data.name,
			description: data.description ?? null,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		});
	}

	update(data: UpdateDocumentTypeDTO): void {
		if (data.name !== undefined) this.name = data.name;
		if (data.description !== undefined) this.description = data.description;
		this.updatedAt = new Date();
	}

	softDelete(): void {
		this.deletedAt = new Date();
	}
}
