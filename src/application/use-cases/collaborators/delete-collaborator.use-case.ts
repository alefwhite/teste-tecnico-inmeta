import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type { CollaboratorsRepository } from "@/domain/repositories/collaborators.repository";

export class DeleteCollaboratorUseCase {
	constructor(private collaboratorsRepository: CollaboratorsRepository) {}

	async execute(id: string) {
		const existing = await this.collaboratorsRepository.findById(id);

		if (!existing) {
			throw new ResourceNotFoundError("Collaborator not found");
		}

		return this.collaboratorsRepository.softDelete(id);
	}
}
