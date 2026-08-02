import { ConflictError } from "@/domain/errors/conflict-error";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type { PasswordHasherProvider } from "@/domain/providers/password-hasher.provider";
import type { CollaboratorsRepository } from "@/domain/repositories/collaborators.repository";

export interface UpdateCollaboratorUseCaseInput {
	name?: string;
	email?: string;
	password?: string;
}

export class UpdateCollaboratorUseCase {
	constructor(
		private collaboratorsRepository: CollaboratorsRepository,
		private passwordHasher: PasswordHasherProvider,
	) {}

	async execute(id: string, data: UpdateCollaboratorUseCaseInput) {
		const existing = await this.collaboratorsRepository.findById(id);

		if (!existing) {
			throw new ResourceNotFoundError("Collaborator not found");
		}

		if (data.email && data.email !== existing.email) {
			const withSameEmail = await this.collaboratorsRepository.findByEmail(
				data.email,
			);

			if (withSameEmail) {
				throw new ConflictError("Collaborator with this email already exists.");
			}
		}

		const password = data.password
			? await this.passwordHasher.hash(data.password)
			: undefined;

		return this.collaboratorsRepository.update(id, {
			name: data.name,
			email: data.email,
			password,
		});
	}
}
