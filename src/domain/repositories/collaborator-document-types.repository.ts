import type { CollaboratorDocumentType } from "@/domain/entities/collaborator-document-type.entity";

export interface CollaboratorDocumentTypesRepository {
	create(data: {
		collaboratorId: string;
		documentTypeId: string;
	}): Promise<CollaboratorDocumentType>;

	findByCollaboratorAndDocumentType(
		collaboratorId: string,
		documentTypeId: string,
	): Promise<CollaboratorDocumentType | null>;

	unlink(collaboratorId: string, documentTypeId: string): Promise<void>;
}
