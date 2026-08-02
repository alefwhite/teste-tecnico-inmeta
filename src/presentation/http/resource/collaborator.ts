import type { Collaborator } from "@/domain/entities/collaborator.entity";

export class CollaboratorResource {
	static make(collaborator: Collaborator) {
		return {
			id: collaborator.id,
			name: collaborator.name,
			email: collaborator.email,
		};
	}
}
