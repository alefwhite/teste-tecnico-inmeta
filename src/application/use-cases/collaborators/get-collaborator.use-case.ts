import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type { CollaboratorsRepository } from "@/domain/repositories/collaborators.repository";

export class GetCollaboratorUseCase {
	constructor(private collaboratorsRepository: CollaboratorsRepository) {}

	async execute(id: string) {
		const collaborator = await this.collaboratorsRepository.findById(id);

		if (!collaborator) {
			throw new ResourceNotFoundError("Collaborator not found");
		}

		return collaborator;
	}
}
