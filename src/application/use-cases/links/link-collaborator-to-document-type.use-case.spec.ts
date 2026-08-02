import { beforeEach, describe, expect, it } from "vitest";
import { ConflictError } from "@/domain/errors/conflict-error";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import { InMemoryCollaboratorDocumentTypesRepository } from "@/tests/fakes/in-memory-collaborator-document-types-repository";
import { InMemoryCollaboratorsRepository } from "@/tests/fakes/in-memory-collaborators-repository";
import { InMemoryDocumentTypesRepository } from "@/tests/fakes/in-memory-document-types-repository";
import { LinkCollaboratorToDocumentTypeUseCase } from "./link-collaborator-to-document-type.use-case";

describe("LinkCollaboratorToDocumentTypeUseCase", () => {
	let collaboratorsRepository: InMemoryCollaboratorsRepository;
	let documentTypesRepository: InMemoryDocumentTypesRepository;
	let linksRepository: InMemoryCollaboratorDocumentTypesRepository;
	let useCase: LinkCollaboratorToDocumentTypeUseCase;

	beforeEach(() => {
		collaboratorsRepository = new InMemoryCollaboratorsRepository();
		documentTypesRepository = new InMemoryDocumentTypesRepository();
		linksRepository = new InMemoryCollaboratorDocumentTypesRepository();
		useCase = new LinkCollaboratorToDocumentTypeUseCase(
			collaboratorsRepository,
			documentTypesRepository,
			linksRepository,
		);
	});

	it("links a collaborator to a document type", async () => {
		const collaborator = await collaboratorsRepository.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed:123",
		});
		const documentType = await documentTypesRepository.create({ name: "RG" });

		const link = await useCase.execute({
			collaboratorId: collaborator.id,
			documentTypeId: documentType.id,
		});

		expect(link.collaboratorId).toBe(collaborator.id);
		expect(link.documentTypeId).toBe(documentType.id);
	});

	it("throws a not found error when collaborator does not exist", async () => {
		const documentType = await documentTypesRepository.create({ name: "RG" });

		await expect(
			useCase.execute({
				collaboratorId: "missing",
				documentTypeId: documentType.id,
			}),
		).rejects.toBeInstanceOf(ResourceNotFoundError);
	});

	it("throws a not found error when document type does not exist", async () => {
		const collaborator = await collaboratorsRepository.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed:123",
		});

		await expect(
			useCase.execute({
				collaboratorId: collaborator.id,
				documentTypeId: "missing",
			}),
		).rejects.toBeInstanceOf(ResourceNotFoundError);
	});

	it("throws a conflict when the link already exists", async () => {
		const collaborator = await collaboratorsRepository.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed:123",
		});
		const documentType = await documentTypesRepository.create({ name: "RG" });

		await useCase.execute({
			collaboratorId: collaborator.id,
			documentTypeId: documentType.id,
		});

		await expect(
			useCase.execute({
				collaboratorId: collaborator.id,
				documentTypeId: documentType.id,
			}),
		).rejects.toBeInstanceOf(ConflictError);
	});
});
