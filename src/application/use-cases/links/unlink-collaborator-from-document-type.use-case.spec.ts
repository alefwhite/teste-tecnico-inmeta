import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import { InMemoryCollaboratorDocumentTypesRepository } from "@/tests/fakes/in-memory-collaborator-document-types-repository";
import { UnlinkCollaboratorFromDocumentTypeUseCase } from "./unlink-collaborator-from-document-type.use-case";

describe("UnlinkCollaboratorFromDocumentTypeUseCase", () => {
	let linksRepository: InMemoryCollaboratorDocumentTypesRepository;
	let useCase: UnlinkCollaboratorFromDocumentTypeUseCase;

	beforeEach(() => {
		linksRepository = new InMemoryCollaboratorDocumentTypesRepository();
		useCase = new UnlinkCollaboratorFromDocumentTypeUseCase(linksRepository);
	});

	it("removes the existing link", async () => {
		await linksRepository.create({
			collaboratorId: "collaborator-1",
			documentTypeId: "type-1",
		});

		await useCase.execute("collaborator-1", "type-1");

		await expect(
			linksRepository.findByCollaboratorAndDocumentType(
				"collaborator-1",
				"type-1",
			),
		).resolves.toBeNull();
	});

	it("throws a not found error when there is no link", async () => {
		await expect(
			useCase.execute("collaborator-1", "type-1"),
		).rejects.toBeInstanceOf(ResourceNotFoundError);
	});
});
