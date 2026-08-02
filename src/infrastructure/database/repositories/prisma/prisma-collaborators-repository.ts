import {
	Collaborator,
	type CreateCollaboratorDTO,
	type UpdateCollaboratorDTO,
} from "@/domain/entities/collaborator.entity";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type {
	CollaboratorsRepository,
	FindManyCollaboratorsParams,
} from "@/domain/repositories/collaborators.repository";
import { Prisma } from "@/generated/prisma/client";
import type { CollaboratorsModel } from "@/generated/prisma/models/Collaborators";
import { prisma } from "@/infrastructure/database/prisma";
import type { Paginated } from "@/shared/types/pagination";
import { buildPaginationMeta } from "@/shared/types/pagination";

export class PrismaCollaboratorsRepository implements CollaboratorsRepository {
	async create(data: CreateCollaboratorDTO): Promise<Collaborator> {
		const collaborator = await prisma.collaborators.create({
			data,
		});

		return CollaboratorMapper.toDomain(collaborator);
	}

	async findByEmail(email: string): Promise<Collaborator | null> {
		const collaborator = await prisma.collaborators.findFirst({
			where: { email, deletedAt: null },
		});

		return collaborator ? CollaboratorMapper.toDomain(collaborator) : null;
	}

	async findById(id: string): Promise<Collaborator | null> {
		const collaborator = await prisma.collaborators.findFirst({
			where: { id, deletedAt: null },
		});

		return collaborator ? CollaboratorMapper.toDomain(collaborator) : null;
	}

	async findMany(
		params: FindManyCollaboratorsParams,
	): Promise<Paginated<Collaborator>> {
		const { page, limit, search } = params;

		const where: Prisma.CollaboratorsWhereInput = {
			deletedAt: null,
			...(search
				? {
						OR: [
							{
								name: { contains: search, mode: Prisma.QueryMode.insensitive },
							},
							{
								email: { contains: search, mode: Prisma.QueryMode.insensitive },
							},
						],
					}
				: {}),
		};

		const [collaborators, total] = await Promise.all([
			prisma.collaborators.findMany({
				where,
				orderBy: { name: "asc" },
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.collaborators.count({ where }),
		]);

		return {
			data: collaborators.map(CollaboratorMapper.toDomain),
			meta: buildPaginationMeta({ page, limit }, total),
		};
	}

	async update(id: string, data: UpdateCollaboratorDTO): Promise<Collaborator> {
		const collaborator = await prisma.collaborators.update({
			where: { id },
			data,
		});

		return CollaboratorMapper.toDomain(collaborator);
	}

	async softDelete(id: string): Promise<Collaborator> {
		const collaborator = await prisma.$transaction(async (tx) => {
			const existing = await tx.collaborators.findFirst({
				where: { id, deletedAt: null },
			});

			if (!existing) {
				throw new ResourceNotFoundError("Collaborator not found");
			}

			const deleted = await tx.collaborators.update({
				where: { id },
				data: { deletedAt: new Date() },
			});

			await tx.documents.updateMany({
				where: { collaboratorId: id, deletedAt: null },
				data: { deletedAt: new Date() },
			});

			return deleted;
		});

		return CollaboratorMapper.toDomain(collaborator);
	}
}

export class CollaboratorMapper {
	static toDomain(collaborator: CollaboratorsModel): Collaborator {
		return new Collaborator({
			id: collaborator.id,
			name: collaborator.name,
			email: collaborator.email,
			password: collaborator.password,
			createdAt: collaborator.createdAt,
			updatedAt: collaborator.updatedAt,
			deletedAt: collaborator.deletedAt,
		});
	}
}
