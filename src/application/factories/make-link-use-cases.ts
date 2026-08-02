import { LinkCollaboratorToDocumentTypeUseCase } from "@/application/use-cases/links/link-collaborator-to-document-type.use-case";
import { UnlinkCollaboratorFromDocumentTypeUseCase } from "@/application/use-cases/links/unlink-collaborator-from-document-type.use-case";
import { PrismaCollaboratorDocumentTypesRepository } from "@/infrastructure/database/repositories/prisma/prisma-collaborator-document-types-repository";
import { PrismaCollaboratorsRepository } from "@/infrastructure/database/repositories/prisma/prisma-collaborators-repository";
import { PrismaDocumentTypesRepository } from "@/infrastructure/database/repositories/prisma/prisma-document-types-repository";

const collaboratorsRepository = new PrismaCollaboratorsRepository();
const documentTypesRepository = new PrismaDocumentTypesRepository();
const collaboratorDocumentTypesRepository =
	new PrismaCollaboratorDocumentTypesRepository();

export const makeLinkCollaboratorToDocumentTypeUseCase = () =>
	new LinkCollaboratorToDocumentTypeUseCase(
		collaboratorsRepository,
		documentTypesRepository,
		collaboratorDocumentTypesRepository,
	);

export const makeUnlinkCollaboratorFromDocumentTypeUseCase = () =>
	new UnlinkCollaboratorFromDocumentTypeUseCase(
		collaboratorDocumentTypesRepository,
	);
