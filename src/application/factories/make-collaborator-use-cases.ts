import { CreateCollaboratorUseCase } from "@/application/use-cases/collaborators/create-collaborator.use-case";
import { DeleteCollaboratorUseCase } from "@/application/use-cases/collaborators/delete-collaborator.use-case";
import { GetCollaboratorUseCase } from "@/application/use-cases/collaborators/get-collaborator.use-case";
import { ListCollaboratorsUseCase } from "@/application/use-cases/collaborators/list-collaborators.use-case";
import { UpdateCollaboratorUseCase } from "@/application/use-cases/collaborators/update-collaborator.use-case";
import { BcryptPasswordHasher } from "@/infrastructure/auth/bcrypt-password-hasher";
import { PrismaCollaboratorsRepository } from "@/infrastructure/database/repositories/prisma/prisma-collaborators-repository";

const collaboratorsRepository = new PrismaCollaboratorsRepository();
const passwordHasher = new BcryptPasswordHasher();

export const makeCreateCollaboratorUseCase = () =>
	new CreateCollaboratorUseCase(collaboratorsRepository, passwordHasher);

export const makeListCollaboratorsUseCase = () =>
	new ListCollaboratorsUseCase(collaboratorsRepository);

export const makeGetCollaboratorUseCase = () =>
	new GetCollaboratorUseCase(collaboratorsRepository);

export const makeUpdateCollaboratorUseCase = () =>
	new UpdateCollaboratorUseCase(collaboratorsRepository, passwordHasher);

export const makeDeleteCollaboratorUseCase = () =>
	new DeleteCollaboratorUseCase(collaboratorsRepository);
