import type { FastifyInstance } from "fastify";
import { LoginUseCase } from "@/application/use-cases/auth/login.use-case";
import { BcryptPasswordHasher } from "@/infrastructure/auth/bcrypt-password-hasher";
import { FastifyTokenProvider } from "@/infrastructure/auth/fastify-token-provider";
import { PrismaCollaboratorsRepository } from "@/infrastructure/database/repositories/prisma/prisma-collaborators-repository";

export const makeLoginUseCase = (app: FastifyInstance) =>
	new LoginUseCase(
		new PrismaCollaboratorsRepository(),
		new BcryptPasswordHasher(),
		new FastifyTokenProvider(app.jwt),
	);
