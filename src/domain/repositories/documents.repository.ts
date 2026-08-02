import type { Document } from "@/domain/entities/document.entity";
import type { DocumentVersion } from "@/domain/entities/document-version.entity";
import type { Paginated } from "@/shared/types/pagination";

export interface SubmitDocumentInput {
	collaboratorId: string;
	documentTypeId: string;
	fileName: string;
	fileSize: number;
	mimeType: string;
	storageKey: string;
	storageUrl: string;
}

export interface SubmitDocumentResult {
	document: Document;
	version: DocumentVersion;
}

export interface DocumentWithLatestVersion {
	document: Document;
	latestVersion: DocumentVersion;
}

export interface PendingDocument {
	collaborator: {
		id: string;
		name: string;
		email: string;
	};
	documentType: {
		id: string;
		name: string;
	};
	linkedAt: Date;
}

export interface FindManyPendingDocumentsParams {
	page: number;
	limit: number;
	collaboratorId?: string;
	documentTypeId?: string;
	search?: string;
}

export interface DocumentsRepository {
	submit(data: SubmitDocumentInput): Promise<SubmitDocumentResult>;
	findById(id: string): Promise<Document | null>;
	findWithLatestVersion(id: string): Promise<DocumentWithLatestVersion | null>;
	findVersions(documentId: string): Promise<DocumentVersion[]>;
	softDelete(id: string): Promise<Document>;
	findManyPending(
		params: FindManyPendingDocumentsParams,
	): Promise<Paginated<PendingDocument>>;
}
