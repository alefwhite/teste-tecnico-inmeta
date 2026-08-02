import type { Collaborator } from "@/domain/entities/collaborator.entity";

interface LoginResult {
	accessToken: string;
	refreshToken: string;
	collaborator: Collaborator;
}

export class AuthResource {
	static make(result: LoginResult) {
		return {
			accessToken: result.accessToken,
			collaborator: {
				id: result.collaborator.id,
				name: result.collaborator.name,
				email: result.collaborator.email,
			},
		};
	}
}
