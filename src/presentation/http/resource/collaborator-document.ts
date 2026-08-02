import type { CollaboratorDocument } from "@/domain/repositories/documents.repository";

export class CollaboratorDocumentResource {
	static make(item: CollaboratorDocument) {
		return {
			document: item.document,
			documentType: item.documentType,
			activeVersion: {
				id: item.activeVersion.id,
				versionNumber: item.activeVersion.versionNumber,
				fileName: item.activeVersion.fileName,
				fileSize: item.activeVersion.fileSize,
				mimeType: item.activeVersion.mimeType,
				storageKey: item.activeVersion.storageKey,
				storageUrl: item.activeVersion.storageUrl,
				createdAt: item.activeVersion.createdAt,
			},
		};
	}
}
