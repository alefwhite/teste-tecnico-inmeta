import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type { DocumentsRepository } from "@/domain/repositories/documents.repository";

export class GetDocumentHistoryUseCase {
	constructor(private documentsRepository: DocumentsRepository) {}

	async execute(documentId: string) {
		const document = await this.documentsRepository.findById(documentId);

		if (!document) {
			throw new ResourceNotFoundError("Document not found");
		}

		const versions = await this.documentsRepository.findVersions(documentId);

		return { document, versions };
	}
}
