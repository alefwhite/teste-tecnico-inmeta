import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import { InMemoryCollaboratorsRepository } from "@/tests/fakes/in-memory-collaborators-repository";
import { InMemoryDocumentsRepository } from "@/tests/fakes/in-memory-documents-repository";
import { ListCollaboratorDocumentsUseCase } from "./list-collaborator-documents.use-case";

describe("ListCollaboratorDocumentsUseCase", () => {
	let collaboratorsRepository: InMemoryCollaboratorsRepository;
	let documentsRepository: InMemoryDocumentsRepository;
	let useCase: ListCollaboratorDocumentsUseCase;

	beforeEach(async () => {
		collaboratorsRepository = new InMemoryCollaboratorsRepository();
		documentsRepository = new InMemoryDocumentsRepository();
		useCase = new ListCollaboratorDocumentsUseCase(
			collaboratorsRepository,
			documentsRepository,
		);
	});

	it("returns each document with its latest version as active", async () => {
		const collaborator = await collaboratorsRepository.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "secret123",
		});

		documentsRepository.seedDocumentType("type-rg", "RG");
		documentsRepository.seedDocumentType("type-cpf", "CPF");

		const rg = await documentsRepository.submit({
			collaboratorId: collaborator.id,
			documentTypeId: "type-rg",
			fileName: "rg.pdf",
			fileSize: 1024,
			mimeType: "application/pdf",
			storageKey: "fake/rg.pdf",
			storageUrl: "/uploads/fake/rg.pdf",
		});

		await documentsRepository.submit({
			collaboratorId: collaborator.id,
			documentTypeId: "type-rg",
			fileName: "rg-v2.pdf",
			fileSize: 2048,
			mimeType: "application/pdf",
			storageKey: "fake/rg-v2.pdf",
			storageUrl: "/uploads/fake/rg-v2.pdf",
		});

		await documentsRepository.submit({
			collaboratorId: collaborator.id,
			documentTypeId: "type-cpf",
			fileName: "cpf.pdf",
			fileSize: 512,
			mimeType: "application/pdf",
			storageKey: "fake/cpf.pdf",
			storageUrl: "/uploads/fake/cpf.pdf",
		});

		const result = await useCase.execute({
			collaboratorId: collaborator.id,
			page: 1,
			limit: 20,
		});

		expect(result.meta.total).toBe(2);

		const rgItem = result.data.find(
			(item) => item.documentType.id === "type-rg",
		);
		expect(rgItem?.document.id).toBe(rg.document.id);
		expect(rgItem?.documentType.name).toBe("RG");
		expect(rgItem?.activeVersion.versionNumber).toBe(2);
		expect(rgItem?.activeVersion.fileName).toBe("rg-v2.pdf");
	});

	it("throws a not found error for an unknown collaborator", async () => {
		await expect(
			useCase.execute({ collaboratorId: "missing-id", page: 1, limit: 20 }),
		).rejects.toBeInstanceOf(ResourceNotFoundError);
	});
});
