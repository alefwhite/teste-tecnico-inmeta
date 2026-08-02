import type { Document } from "@/domain/entities/document.entity";
import type { DocumentVersion } from "@/domain/entities/document-version.entity";

interface SubmitDocumentResult {
	document: Document;
	version: DocumentVersion;
}

export class DocumentResource {
	static make(result: SubmitDocumentResult) {
		return {
			document: {
				id: result.document.id,
				collaboratorId: result.document.collaboratorId,
				documentTypeId: result.document.documentTypeId,
			},
			version: {
				id: result.version.id,
				versionNumber: result.version.versionNumber,
				fileName: result.version.fileName,
				fileSize: result.version.fileSize,
				mimeType: result.version.mimeType,
				storageKey: result.version.storageKey,
				storageUrl: result.version.storageUrl,
				createdAt: result.version.createdAt,
			},
		};
	}
}
