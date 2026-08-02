import { Collaborator } from "@/domain/entities/collaborator.entity";
import { ConflictError } from "@/domain/errors/conflict-error";
import type { CollaboratorsRepository } from "@/domain/repositories/collaborators.repository";

export interface CreateCollaboratorUseCaseInput {
	name: string;
	email: string;
	password: string;
}

export class CreateCollaboratorUseCase {
	constructor(private collaboratorsRepository: CollaboratorsRepository) {}

	async execute(data: CreateCollaboratorUseCaseInput): Promise<Collaborator> {
		const existingCollaborator = await this.collaboratorsRepository.findByEmail(
			data.email,
		);

		if (existingCollaborator) {
			throw new ConflictError("Collaborator with this email already exists.");
		}

		const collaborator = Collaborator.create({
			name: data.name,
			email: data.email,
			password: data.password,
		});

		const createdCollaborator =
			await this.collaboratorsRepository.create(collaborator);

		return createdCollaborator;
	}
}
