import {
	type CreateDocumentTypeDTO,
	DocumentType,
	type UpdateDocumentTypeDTO,
} from "@/domain/entities/document-type.entity";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type { DocumentTypesRepository } from "@/domain/repositories/document-types.repository";

export class InMemoryDocumentTypesRepository
	implements DocumentTypesRepository
{
	private documentTypes = new Map<string, DocumentType>();

	async create(data: CreateDocumentTypeDTO): Promise<DocumentType> {
		const documentType = DocumentType.create(data);

		this.documentTypes.set(documentType.id, documentType);

		return documentType;
	}

	async findById(id: string): Promise<DocumentType | null> {
		const documentType = this.documentTypes.get(id);

		return documentType && !documentType.deletedAt ? documentType : null;
	}

	async findByName(name: string): Promise<DocumentType | null> {
		for (const documentType of this.documentTypes.values()) {
			if (documentType.name === name && !documentType.deletedAt) {
				return documentType;
			}
		}

		return null;
	}

	async findAll(): Promise<DocumentType[]> {
		return [...this.documentTypes.values()]
			.filter((documentType) => !documentType.deletedAt)
			.sort((a, b) => a.name.localeCompare(b.name));
	}

	async update(id: string, data: UpdateDocumentTypeDTO): Promise<DocumentType> {
		const documentType = this.documentTypes.get(id);

		if (!documentType) {
			throw new ResourceNotFoundError("Document type not found");
		}

		documentType.update(data);

		return documentType;
	}

	async softDelete(id: string): Promise<DocumentType> {
		const documentType = this.documentTypes.get(id);

		if (!documentType || documentType.deletedAt) {
			throw new ResourceNotFoundError("Document type not found");
		}

		documentType.softDelete();

		return documentType;
	}
}
