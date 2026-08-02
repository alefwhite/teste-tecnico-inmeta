import type { Document } from "@/domain/entities/document.entity";
import type { DocumentVersion } from "@/domain/entities/document-version.entity";

interface DocumentHistory {
	document: Document;
	versions: DocumentVersion[];
}

export class DocumentHistoryResource {
	static make(history: DocumentHistory) {
		return {
			documentId: history.document.id,
			versions: history.versions.map((version) => ({
				id: version.id,
				versionNumber: version.versionNumber,
				fileName: version.fileName,
				fileSize: version.fileSize,
				mimeType: version.mimeType,
				storageKey: version.storageKey,
				storageUrl: version.storageUrl,
				createdAt: version.createdAt,
			})),
		};
	}
}
