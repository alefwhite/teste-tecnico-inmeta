import { UnauthorizedError } from "@/domain/errors/unauthorized-error";
import type { PasswordHasherProvider } from "@/domain/providers/password-hasher.provider";
import type { TokenProvider } from "@/domain/providers/token.provider";
import type { CollaboratorsRepository } from "@/domain/repositories/collaborators.repository";

export interface LoginUseCaseInput {
	email: string;
	password: string;
}

export class LoginUseCase {
	constructor(
		private collaboratorsRepository: CollaboratorsRepository,
		private passwordHasher: PasswordHasherProvider,
		private tokenProvider: TokenProvider,
	) {}

	async execute(data: LoginUseCaseInput) {
		const collaborator = await this.collaboratorsRepository.findByEmail(
			data.email,
		);

		if (!collaborator) {
			throw new UnauthorizedError("Invalid credentials");
		}

		const passwordMatches = await this.passwordHasher.compare(
			data.password,
			collaborator.password,
		);

		if (!passwordMatches) {
			throw new UnauthorizedError("Invalid credentials");
		}

		const accessToken = this.tokenProvider.signAccessToken({
			sub: collaborator.id,
		});
		const refreshToken = this.tokenProvider.signRefreshToken({
			sub: collaborator.id,
		});

		return { accessToken, refreshToken, collaborator };
	}
}
