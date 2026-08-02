import { Document } from "@/domain/entities/document.entity";
import { DocumentVersion } from "@/domain/entities/document-version.entity";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type {
	DocumentsRepository,
	DocumentWithLatestVersion,
	FindManyPendingDocumentsParams,
	PendingDocument,
	SubmitDocumentInput,
	SubmitDocumentResult,
} from "@/domain/repositories/documents.repository";
import { buildPaginationMeta, type Paginated } from "@/shared/types/pagination";

export class InMemoryDocumentsRepository implements DocumentsRepository {
	private documents = new Map<string, Document>();
	private versions = new Map<string, DocumentVersion[]>();
	private pending: PendingDocument[] = [];

	seedPending(pending: PendingDocument[]): void {
		this.pending = pending;
	}

	async submit(data: SubmitDocumentInput): Promise<SubmitDocumentResult> {
		let document = [...this.documents.values()].find(
			(candidate) =>
				candidate.collaboratorId === data.collaboratorId &&
				candidate.documentTypeId === data.documentTypeId,
		);

		if (!document) {
			document = Document.create({
				collaboratorId: data.collaboratorId,
				documentTypeId: data.documentTypeId,
			});

			this.documents.set(document.id, document);
			this.versions.set(document.id, []);
		} else if (document.deletedAt) {
			document = new Document({
				...document,
				deletedAt: null,
				updatedAt: new Date(),
			});

			this.documents.set(document.id, document);
		}

		let currentVersions = this.versions.get(document.id);

		if (!currentVersions) {
			currentVersions = [];
			this.versions.set(document.id, currentVersions);
		}

		const version = DocumentVersion.create({
			documentId: document.id,
			versionNumber: currentVersions.length + 1,
			fileName: data.fileName,
			fileSize: data.fileSize,
			mimeType: data.mimeType,
			storageKey: data.storageKey,
			storageUrl: data.storageUrl,
		});

		currentVersions.push(version);

		return { document, version };
	}

	async findById(id: string): Promise<Document | null> {
		const document = this.documents.get(id);

		return document && !document.deletedAt ? document : null;
	}

	async findWithLatestVersion(
		id: string,
	): Promise<DocumentWithLatestVersion | null> {
		const document = this.documents.get(id);

		if (!document || document.deletedAt) {
			return null;
		}

		const versions = this.versions.get(id) ?? [];
		const latest = versions[versions.length - 1];

		return latest ? { document, latestVersion: latest } : null;
	}

	async findVersions(documentId: string): Promise<DocumentVersion[]> {
		return [...(this.versions.get(documentId) ?? [])];
	}

	async softDelete(id: string): Promise<Document> {
		const document = this.documents.get(id);

		if (!document || document.deletedAt) {
			throw new ResourceNotFoundError("Document not found");
		}

		document.softDelete();

		return document;
	}

	async findManyPending(
		params: FindManyPendingDocumentsParams,
	): Promise<Paginated<PendingDocument>> {
		let list = this.pending;

		if (params.collaboratorId) {
			list = list.filter(
				(item) => item.collaborator.id === params.collaboratorId,
			);
		}

		if (params.documentTypeId) {
			list = list.filter(
				(item) => item.documentType.id === params.documentTypeId,
			);
		}

		if (params.search) {
			const search = params.search.toLowerCase();

			list = list.filter(
				(item) =>
					item.collaborator.name.toLowerCase().includes(search) ||
					item.documentType.name.toLowerCase().includes(search),
			);
		}

		const start = (params.page - 1) * params.limit;

		return {
			data: list.slice(start, start + params.limit),
			meta: buildPaginationMeta(
				{ page: params.page, limit: params.limit },
				list.length,
			),
		};
	}
}
