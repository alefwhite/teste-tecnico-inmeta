import * as crypto from "node:crypto";

export interface CollaboratorDocumentTypeAttributes {
	id: string;
	collaboratorId: string;
	documentTypeId: string;
	createdAt: Date;
}

export interface LinkCollaboratorToDocumentTypeDTO {
	collaboratorId: string;
	documentTypeId: string;
}

export class CollaboratorDocumentType {
	id: string;
	collaboratorId: string;
	documentTypeId: string;
	createdAt: Date;

	constructor(attributes: CollaboratorDocumentTypeAttributes) {
		this.id = attributes.id;
		this.collaboratorId = attributes.collaboratorId;
		this.documentTypeId = attributes.documentTypeId;
		this.createdAt = attributes.createdAt;
	}

	static create(
		data: LinkCollaboratorToDocumentTypeDTO,
	): CollaboratorDocumentType {
		return new CollaboratorDocumentType({
			id: crypto.randomUUID(),
			collaboratorId: data.collaboratorId,
			documentTypeId: data.documentTypeId,
			createdAt: new Date(),
		});
	}
}
