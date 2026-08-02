import {
	Collaborator,
	type UpdateCollaboratorDTO,
} from "@/domain/entities/collaborator.entity";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type {
	CollaboratorsRepository,
	CreateCollaboratorDTO,
	FindManyCollaboratorsParams,
} from "@/domain/repositories/collaborators.repository";
import { buildPaginationMeta, type Paginated } from "@/shared/types/pagination";

export class InMemoryCollaboratorsRepository
	implements CollaboratorsRepository
{
	private collaborators = new Map<string, Collaborator>();

	async create(data: CreateCollaboratorDTO): Promise<Collaborator> {
		const collaborator = Collaborator.create(data);

		this.collaborators.set(collaborator.id, collaborator);

		return collaborator;
	}

	async findByEmail(email: string): Promise<Collaborator | null> {
		for (const collaborator of this.collaborators.values()) {
			if (collaborator.email === email && !collaborator.deletedAt) {
				return collaborator;
			}
		}

		return null;
	}

	async findById(id: string): Promise<Collaborator | null> {
		const collaborator = this.collaborators.get(id);

		return collaborator && !collaborator.deletedAt ? collaborator : null;
	}

	async findMany(
		params: FindManyCollaboratorsParams,
	): Promise<Paginated<Collaborator>> {
		const search = params.search?.toLowerCase();

		const filtered = [...this.collaborators.values()]
			.filter((collaborator) => !collaborator.deletedAt)
			.filter(
				(collaborator) =>
					!search ||
					collaborator.name.toLowerCase().includes(search) ||
					collaborator.email.toLowerCase().includes(search),
			)
			.sort((a, b) => a.name.localeCompare(b.name));

		const start = (params.page - 1) * params.limit;

		return {
			data: filtered.slice(start, start + params.limit),
			meta: buildPaginationMeta(
				{ page: params.page, limit: params.limit },
				filtered.length,
			),
		};
	}

	async update(id: string, data: UpdateCollaboratorDTO): Promise<Collaborator> {
		const collaborator = this.collaborators.get(id);

		if (!collaborator) {
			throw new ResourceNotFoundError("Collaborator not found");
		}

		collaborator.update(data);

		return collaborator;
	}

	async softDelete(id: string): Promise<Collaborator> {
		const collaborator = this.collaborators.get(id);

		if (!collaborator || collaborator.deletedAt) {
			throw new ResourceNotFoundError("Collaborator not found");
		}

		collaborator.softDelete();

		return collaborator;
	}
}
