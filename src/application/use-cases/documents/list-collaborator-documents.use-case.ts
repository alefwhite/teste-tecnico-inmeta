import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type { CollaboratorsRepository } from "@/domain/repositories/collaborators.repository";
import type {
	DocumentsRepository,
	FindManyCollaboratorDocumentsParams,
} from "@/domain/repositories/documents.repository";

export class ListCollaboratorDocumentsUseCase {
	constructor(
		private collaboratorsRepository: CollaboratorsRepository,
		private documentsRepository: DocumentsRepository,
	) {}

	async execute(params: FindManyCollaboratorDocumentsParams) {
		const collaborator = await this.collaboratorsRepository.findById(
			params.collaboratorId,
		);

		if (!collaborator) {
			throw new ResourceNotFoundError("Collaborator not found");
		}

		return this.documentsRepository.findManyByCollaborator(params);
	}
}
