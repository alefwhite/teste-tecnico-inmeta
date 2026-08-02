import { CollaboratorDocumentType } from "@/domain/entities/collaborator-document-type.entity";
import type { CollaboratorDocumentTypesRepository } from "@/domain/repositories/collaborator-document-types.repository";
import type { CollaboratorDocumentTypesModel } from "@/generated/prisma/models/CollaboratorDocumentTypes";
import { mapPrismaError } from "@/infrastructure/database/errors";
import { prisma } from "@/infrastructure/database/prisma";

export class PrismaCollaboratorDocumentTypesRepository
	implements CollaboratorDocumentTypesRepository
{
	async create(data: {
		collaboratorId: string;
		documentTypeId: string;
	}): Promise<CollaboratorDocumentType> {
		try {
			const link = await prisma.collaboratorDocumentTypes.create({
				data,
			});

			return CollaboratorDocumentTypeMapper.toDomain(link);
		} catch (error) {
			mapPrismaError(error);
		}
	}

	async findByCollaboratorAndDocumentType(
		collaboratorId: string,
		documentTypeId: string,
	): Promise<CollaboratorDocumentType | null> {
		const link = await prisma.collaboratorDocumentTypes.findUnique({
			where: {
				collaboratorId_documentTypeId: {
					collaboratorId,
					documentTypeId,
				},
			},
		});

		return link ? CollaboratorDocumentTypeMapper.toDomain(link) : null;
	}

	async unlink(collaboratorId: string, documentTypeId: string): Promise<void> {
		await prisma.$transaction(async (tx) => {
			await tx.collaboratorDocumentTypes.deleteMany({
				where: { collaboratorId, documentTypeId },
			});

			await tx.documents.updateMany({
				where: {
					collaboratorId,
					documentTypeId,
					deletedAt: null,
				},
				data: { deletedAt: new Date() },
			});
		});
	}
}

export class CollaboratorDocumentTypeMapper {
	static toDomain(
		link: CollaboratorDocumentTypesModel,
	): CollaboratorDocumentType {
		return new CollaboratorDocumentType({
			id: link.id,
			collaboratorId: link.collaboratorId,
			documentTypeId: link.documentTypeId,
			createdAt: link.createdAt,
		});
	}
}
