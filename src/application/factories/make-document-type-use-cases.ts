import { CreateDocumentTypeUseCase } from "@/application/use-cases/document-types/create-document-type.use-case";
import { DeleteDocumentTypeUseCase } from "@/application/use-cases/document-types/delete-document-type.use-case";
import { ListDocumentTypesUseCase } from "@/application/use-cases/document-types/list-document-types.use-case";
import { UpdateDocumentTypeUseCase } from "@/application/use-cases/document-types/update-document-type.use-case";
import { PrismaDocumentTypesRepository } from "@/infrastructure/database/repositories/prisma/prisma-document-types-repository";

const documentTypesRepository = new PrismaDocumentTypesRepository();

export const makeCreateDocumentTypeUseCase = () =>
	new CreateDocumentTypeUseCase(documentTypesRepository);

export const makeListDocumentTypesUseCase = () =>
	new ListDocumentTypesUseCase(documentTypesRepository);

export const makeUpdateDocumentTypeUseCase = () =>
	new UpdateDocumentTypeUseCase(documentTypesRepository);

export const makeDeleteDocumentTypeUseCase = () =>
	new DeleteDocumentTypeUseCase(documentTypesRepository);
