import type { DocumentTypesRepository } from "@/domain/repositories/document-types.repository";

export class ListDocumentTypesUseCase {
	constructor(private documentTypesRepository: DocumentTypesRepository) {}

	execute() {
		return this.documentTypesRepository.findAll();
	}
}
