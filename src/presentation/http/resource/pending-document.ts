import type { PendingDocument } from "@/domain/repositories/documents.repository";

export class PendingDocumentResource {
	static make(pending: PendingDocument) {
		return {
			collaborator: pending.collaborator,
			documentType: pending.documentType,
			linkedAt: pending.linkedAt,
		};
	}
}
