import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type { DocumentsRepository } from "@/domain/repositories/documents.repository";

export class DeleteDocumentUseCase {
	constructor(private documentsRepository: DocumentsRepository) {}

	async execute(id: string) {
		const existing = await this.documentsRepository.findById(id);

		if (!existing) {
			throw new ResourceNotFoundError("Document not found");
		}

		return this.documentsRepository.softDelete(id);
	}
}
