import type { Collaborator } from "@/domain/entities/collaborator.entity";
import type { Paginated } from "@/shared/types/pagination";

export interface CreateCollaboratorDTO {
	name: string;
	email: string;
	password: string;
}

export interface UpdateCollaboratorDTO {
	name?: string;
	email?: string;
	password?: string;
}

export interface FindManyCollaboratorsParams {
	page: number;
	limit: number;
	search?: string;
}

export interface CollaboratorsRepository {
	create(data: CreateCollaboratorDTO): Promise<Collaborator>;
	findByEmail(email: string): Promise<Collaborator | null>;
	findById(id: string): Promise<Collaborator | null>;
	findMany(
		params: FindManyCollaboratorsParams,
	): Promise<Paginated<Collaborator>>;
	update(id: string, data: UpdateCollaboratorDTO): Promise<Collaborator>;
	softDelete(id: string): Promise<Collaborator>;
}
