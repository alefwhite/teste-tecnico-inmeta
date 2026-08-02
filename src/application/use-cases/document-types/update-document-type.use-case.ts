import { ConflictError } from "@/domain/errors/conflict-error";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type { DocumentTypesRepository } from "@/domain/repositories/document-types.repository";

export interface UpdateDocumentTypeUseCaseInput {
	name?: string;
	description?: string | null;
}

export class UpdateDocumentTypeUseCase {
	constructor(private documentTypesRepository: DocumentTypesRepository) {}

	async execute(id: string, data: UpdateDocumentTypeUseCaseInput) {
		const existing = await this.documentTypesRepository.findById(id);

		if (!existing) {
			throw new ResourceNotFoundError("Document type not found");
		}

		if (data.name && data.name !== existing.name) {
			const withSameName = await this.documentTypesRepository.findByName(
				data.name,
			);

			if (withSameName) {
				throw new ConflictError("Document type with this name already exists.");
			}
		}

		return this.documentTypesRepository.update(id, {
			name: data.name,
			description: data.description,
		});
	}
}
