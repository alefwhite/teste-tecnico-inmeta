import { ConflictError } from "@/domain/errors/conflict-error";
import type { PasswordHasherProvider } from "@/domain/providers/password-hasher.provider";
import type { CollaboratorsRepository } from "@/domain/repositories/collaborators.repository";

export interface CreateCollaboratorUseCaseInput {
	name: string;
	email: string;
	password: string;
}

export class CreateCollaboratorUseCase {
	constructor(
		private collaboratorsRepository: CollaboratorsRepository,
		private passwordHasher: PasswordHasherProvider,
	) {}

	async execute(data: CreateCollaboratorUseCaseInput) {
		const existingCollaborator = await this.collaboratorsRepository.findByEmail(
			data.email,
		);

		if (existingCollaborator) {
			throw new ConflictError("Collaborator with this email already exists.");
		}

		const password = await this.passwordHasher.hash(data.password);

		return this.collaboratorsRepository.create({
			name: data.name,
			email: data.email,
			password,
		});
	}
}
