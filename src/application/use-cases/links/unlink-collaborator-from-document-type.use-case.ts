import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type { CollaboratorDocumentTypesRepository } from "@/domain/repositories/collaborator-document-types.repository";

export class UnlinkCollaboratorFromDocumentTypeUseCase {
	constructor(
		private collaboratorDocumentTypesRepository: CollaboratorDocumentTypesRepository,
	) {}

	async execute(collaboratorId: string, documentTypeId: string) {
		const existing =
			await this.collaboratorDocumentTypesRepository.findByCollaboratorAndDocumentType(
				collaboratorId,
				documentTypeId,
			);

		if (!existing) {
			throw new ResourceNotFoundError(
				"Collaborator is not linked to this document type.",
			);
		}

		await this.collaboratorDocumentTypesRepository.unlink(
			collaboratorId,
			documentTypeId,
		);
	}
}
