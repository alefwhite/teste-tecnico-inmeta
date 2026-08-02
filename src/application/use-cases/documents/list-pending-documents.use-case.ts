import type {
	DocumentsRepository,
	FindManyPendingDocumentsParams,
} from "@/domain/repositories/documents.repository";

export class ListPendingDocumentsUseCase {
	constructor(private documentsRepository: DocumentsRepository) {}

	execute(params: FindManyPendingDocumentsParams) {
		return this.documentsRepository.findManyPending(params);
	}
}
