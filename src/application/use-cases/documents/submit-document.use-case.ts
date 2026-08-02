import { BadRequestError } from "@/domain/errors/bad-request-error";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type { StorageProvider } from "@/domain/providers/storage.provider";
import type { CollaboratorDocumentTypesRepository } from "@/domain/repositories/collaborator-document-types.repository";
import type { CollaboratorsRepository } from "@/domain/repositories/collaborators.repository";
import type { DocumentsRepository } from "@/domain/repositories/documents.repository";

export interface SubmitDocumentUseCaseInput {
	collaboratorId: string;
	documentTypeId: string;
	fileName: string;
	fileSize: number;
	mimeType: string;
	buffer: Buffer;
}

export class SubmitDocumentUseCase {
	constructor(
		private collaboratorsRepository: CollaboratorsRepository,
		private collaboratorDocumentTypesRepository: CollaboratorDocumentTypesRepository,
		private documentsRepository: DocumentsRepository,
		private storageProvider: StorageProvider,
	) {}

	async execute(data: SubmitDocumentUseCaseInput) {
		const collaborator = await this.collaboratorsRepository.findById(
			data.collaboratorId,
		);

		if (!collaborator) {
			throw new ResourceNotFoundError("Collaborator not found");
		}

		const link =
			await this.collaboratorDocumentTypesRepository.findByCollaboratorAndDocumentType(
				data.collaboratorId,
				data.documentTypeId,
			);

		if (!link) {
			throw new BadRequestError(
				"Collaborator is not linked to this document type.",
			);
		}

		const stored = await this.storageProvider.saveFile({
			filename: data.fileName,
			mimetype: data.mimeType,
			data: data.buffer,
		});

		try {
			return await this.documentsRepository.submit({
				collaboratorId: data.collaboratorId,
				documentTypeId: data.documentTypeId,
				fileName: data.fileName,
				fileSize: data.fileSize,
				mimeType: data.mimeType,
				storageKey: stored.key,
				storageUrl: stored.url,
			});
		} catch (error) {
			await this.storageProvider.deleteFile(stored.key).catch(() => {});
			throw error;
		}
	}
}
