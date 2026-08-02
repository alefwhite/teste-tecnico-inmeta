import {
	Collaborator,
	type CreateCollaboratorDTO,
} from "@/domain/entities/collaborator.entity";
import type { CollaboratorsRepository } from "@/domain/repositories/collaborators.repository";
import type { CollaboratorsModel } from "@/generated/prisma/models/Collaborators";
import { prisma } from "@/infrastructure/database/prisma";

export class PrismaCollaboratorsRepository implements CollaboratorsRepository {
	async create(data: CreateCollaboratorDTO): Promise<Collaborator> {
		const collaborator = await prisma.collaborators.create({
			data,
		});

		return CollaboratorMapper.toDomain(collaborator);
	}

	async findByEmail(email: string): Promise<Collaborator | null> {
		const collaborator = await prisma.collaborators.findUnique({
			where: { email },
		});

		if (collaborator) {
			return CollaboratorMapper.toDomain(collaborator);
		}

		return null;
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
