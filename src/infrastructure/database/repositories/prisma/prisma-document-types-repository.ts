import {
	type CreateDocumentTypeDTO,
	DocumentType,
	type UpdateDocumentTypeDTO,
} from "@/domain/entities/document-type.entity";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type { DocumentTypesRepository } from "@/domain/repositories/document-types.repository";
import type { DocumentTypesModel } from "@/generated/prisma/models/DocumentTypes";
import { prisma } from "@/infrastructure/database/prisma";

export class PrismaDocumentTypesRepository implements DocumentTypesRepository {
	async create(data: CreateDocumentTypeDTO): Promise<DocumentType> {
		const documentType = await prisma.documentTypes.create({
			data: {
				name: data.name,
				description: data.description ?? null,
			},
		});

		return DocumentTypeMapper.toDomain(documentType);
	}

	async findById(id: string): Promise<DocumentType | null> {
		const documentType = await prisma.documentTypes.findFirst({
			where: { id, deletedAt: null },
		});

		return documentType ? DocumentTypeMapper.toDomain(documentType) : null;
	}

	async findByName(name: string): Promise<DocumentType | null> {
		const documentType = await prisma.documentTypes.findFirst({
			where: { name, deletedAt: null },
		});

		return documentType ? DocumentTypeMapper.toDomain(documentType) : null;
	}

	async findAll(): Promise<DocumentType[]> {
		const documentTypes = await prisma.documentTypes.findMany({
			where: { deletedAt: null },
			orderBy: { name: "asc" },
		});

		return documentTypes.map(DocumentTypeMapper.toDomain);
	}

	async update(id: string, data: UpdateDocumentTypeDTO): Promise<DocumentType> {
		const existing = await prisma.documentTypes.findFirst({
			where: { id, deletedAt: null },
		});

		if (!existing) {
			throw new ResourceNotFoundError("Document type not found");
		}

		const documentType = await prisma.documentTypes.update({
			where: { id },
			data: {
				name: data.name,
				description: data.description,
			},
		});

		return DocumentTypeMapper.toDomain(documentType);
	}

	async softDelete(id: string): Promise<DocumentType> {
		const existing = await prisma.documentTypes.findFirst({
			where: { id, deletedAt: null },
		});

		if (!existing) {
			throw new ResourceNotFoundError("Document type not found");
		}

		const documentType = await prisma.documentTypes.update({
			where: { id },
			data: { deletedAt: new Date() },
		});

		return DocumentTypeMapper.toDomain(documentType);
	}
}

export class DocumentTypeMapper {
	static toDomain(documentType: DocumentTypesModel): DocumentType {
		return new DocumentType({
			id: documentType.id,
			name: documentType.name,
			description: documentType.description,
			createdAt: documentType.createdAt,
			updatedAt: documentType.updatedAt,
			deletedAt: documentType.deletedAt,
		});
	}
}
