import { ConflictError } from "@/domain/errors/conflict-error";
import type { DocumentTypesRepository } from "@/domain/repositories/document-types.repository";

export interface CreateDocumentTypeUseCaseInput {
	name: string;
	description?: string | null;
}

export class CreateDocumentTypeUseCase {
	constructor(private documentTypesRepository: DocumentTypesRepository) {}

	async execute(data: CreateDocumentTypeUseCaseInput) {
		const existing = await this.documentTypesRepository.findByName(data.name);

		if (existing) {
			throw new ConflictError("Document type with this name already exists.");
		}

		return this.documentTypesRepository.create(data);
	}
}
