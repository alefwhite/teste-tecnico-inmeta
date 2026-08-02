import { ConflictError } from "@/domain/errors/conflict-error";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type { CollaboratorDocumentTypesRepository } from "@/domain/repositories/collaborator-document-types.repository";
import type { CollaboratorsRepository } from "@/domain/repositories/collaborators.repository";
import type { DocumentTypesRepository } from "@/domain/repositories/document-types.repository";

export interface LinkCollaboratorToDocumentTypeUseCaseInput {
	collaboratorId: string;
	documentTypeId: string;
}

export class LinkCollaboratorToDocumentTypeUseCase {
	constructor(
		private collaboratorsRepository: CollaboratorsRepository,
		private documentTypesRepository: DocumentTypesRepository,
		private collaboratorDocumentTypesRepository: CollaboratorDocumentTypesRepository,
	) {}

	async execute(data: LinkCollaboratorToDocumentTypeUseCaseInput) {
		const collaborator = await this.collaboratorsRepository.findById(
			data.collaboratorId,
		);

		if (!collaborator) {
			throw new ResourceNotFoundError("Collaborator not found");
		}

		const documentType = await this.documentTypesRepository.findById(
			data.documentTypeId,
		);

		if (!documentType) {
			throw new ResourceNotFoundError("Document type not found");
		}

		const existing =
			await this.collaboratorDocumentTypesRepository.findByCollaboratorAndDocumentType(
				data.collaboratorId,
				data.documentTypeId,
			);

		if (existing) {
			throw new ConflictError(
				"Collaborator is already linked to this document type.",
			);
		}

		return this.collaboratorDocumentTypesRepository.create(data);
	}
}
