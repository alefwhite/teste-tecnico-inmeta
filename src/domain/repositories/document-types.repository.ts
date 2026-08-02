import type {
	CreateDocumentTypeDTO,
	DocumentType,
	UpdateDocumentTypeDTO,
} from "@/domain/entities/document-type.entity";

export interface DocumentTypesRepository {
	create(data: CreateDocumentTypeDTO): Promise<DocumentType>;
	findById(id: string): Promise<DocumentType | null>;
	findByName(name: string): Promise<DocumentType | null>;
	findAll(): Promise<DocumentType[]>;
	update(id: string, data: UpdateDocumentTypeDTO): Promise<DocumentType>;
	softDelete(id: string): Promise<DocumentType>;
}
