import { DeleteDocumentUseCase } from "@/application/use-cases/documents/delete-document.use-case";
import { GetDocumentHistoryUseCase } from "@/application/use-cases/documents/get-document-history.use-case";
import { ListPendingDocumentsUseCase } from "@/application/use-cases/documents/list-pending-documents.use-case";
import { SubmitDocumentUseCase } from "@/application/use-cases/documents/submit-document.use-case";
import { PrismaCollaboratorDocumentTypesRepository } from "@/infrastructure/database/repositories/prisma/prisma-collaborator-document-types-repository";
import { PrismaCollaboratorsRepository } from "@/infrastructure/database/repositories/prisma/prisma-collaborators-repository";
import { PrismaDocumentsRepository } from "@/infrastructure/database/repositories/prisma/prisma-documents-repository";
import { LocalStorageProvider } from "@/infrastructure/storage/local-storage.provider";

const collaboratorsRepository = new PrismaCollaboratorsRepository();
const collaboratorDocumentTypesRepository =
	new PrismaCollaboratorDocumentTypesRepository();
const documentsRepository = new PrismaDocumentsRepository();
const storageProvider = new LocalStorageProvider();

export const makeSubmitDocumentUseCase = () =>
	new SubmitDocumentUseCase(
		collaboratorsRepository,
		collaboratorDocumentTypesRepository,
		documentsRepository,
		storageProvider,
	);

export const makeListPendingDocumentsUseCase = () =>
	new ListPendingDocumentsUseCase(documentsRepository);

export const makeGetDocumentHistoryUseCase = () =>
	new GetDocumentHistoryUseCase(documentsRepository);

export const makeDeleteDocumentUseCase = () =>
	new DeleteDocumentUseCase(documentsRepository);
