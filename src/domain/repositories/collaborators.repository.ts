import type { Collaborator } from "@/domain/entities/collaborator.entity";

export interface CreateCollaboratorDTO {
	name: string;
	email: string;
	password: string;
}

export interface CollaboratorsRepository {
	create(data: CreateCollaboratorDTO): Promise<Collaborator>;
	findByEmail(email: string): Promise<Collaborator | null>;
}
