import type { DocumentType } from "@/domain/entities/document-type.entity";

export class DocumentTypeResource {
	static make(documentType: DocumentType) {
		return {
			id: documentType.id,
			name: documentType.name,
			description: documentType.description,
		};
	}
}
