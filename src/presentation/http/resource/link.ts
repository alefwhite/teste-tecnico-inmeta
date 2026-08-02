import type { CollaboratorDocumentType } from "@/domain/entities/collaborator-document-type.entity";

export class LinkResource {
	static make(link: CollaboratorDocumentType) {
		return {
			id: link.id,
			collaboratorId: link.collaboratorId,
			documentTypeId: link.documentTypeId,
			createdAt: link.createdAt,
		};
	}
}
