import { CreateCollaboratorUseCase } from "@/application/use-cases/collaborators/create-collaborator.use-case";
import { PrismaCollaboratorsRepository } from "@/infrastructure/database/repositories/prisma/prisma-collaborators-repository";

export const makeCollaboratorUseCase = () => {
	return new CreateCollaboratorUseCase(new PrismaCollaboratorsRepository());
};
