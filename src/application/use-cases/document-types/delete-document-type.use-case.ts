import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type { DocumentTypesRepository } from "@/domain/repositories/document-types.repository";

export class DeleteDocumentTypeUseCase {
	constructor(private documentTypesRepository: DocumentTypesRepository) {}

	async execute(id: string) {
		const existing = await this.documentTypesRepository.findById(id);

		if (!existing) {
			throw new ResourceNotFoundError("Document type not found");
		}

		return this.documentTypesRepository.softDelete(id);
	}
}
