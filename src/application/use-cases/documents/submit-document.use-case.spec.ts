import { beforeEach, describe, expect, it } from "vitest";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import { FakeStorageProvider } from "@/tests/fakes/fake-storage-provider";
import { InMemoryCollaboratorDocumentTypesRepository } from "@/tests/fakes/in-memory-collaborator-document-types-repository";
import { InMemoryCollaboratorsRepository } from "@/tests/fakes/in-memory-collaborators-repository";
import { InMemoryDocumentsRepository } from "@/tests/fakes/in-memory-documents-repository";
import { SubmitDocumentUseCase } from "./submit-document.use-case";

describe("SubmitDocumentUseCase", () => {
	let collaboratorsRepository: InMemoryCollaboratorsRepository;
	let linksRepository: InMemoryCollaboratorDocumentTypesRepository;
	let documentsRepository: InMemoryDocumentsRepository;
	let storageProvider: FakeStorageProvider;
	let useCase: SubmitDocumentUseCase;

	beforeEach(() => {
		collaboratorsRepository = new InMemoryCollaboratorsRepository();
		linksRepository = new InMemoryCollaboratorDocumentTypesRepository();
		documentsRepository = new InMemoryDocumentsRepository();
		storageProvider = new FakeStorageProvider();
		useCase = new SubmitDocumentUseCase(
			collaboratorsRepository,
			linksRepository,
			documentsRepository,
			storageProvider,
		);
	});

	async function createLinkedSetup() {
		const collaborator = await collaboratorsRepository.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed:123",
		});

		await linksRepository.create({
			collaboratorId: collaborator.id,
			documentTypeId: "type-1",
		});

		return collaborator;
	}

	it("submits the first version of a document", async () => {
		const collaborator = await createLinkedSetup();

		const result = await useCase.execute({
			collaboratorId: collaborator.id,
			documentTypeId: "type-1",
			fileName: "rg.pdf",
			fileSize: 1024,
			mimeType: "application/pdf",
			buffer: Buffer.from("pdf-content"),
		});

		expect(result.version.versionNumber).toBe(1);
		expect(result.version.fileName).toBe("rg.pdf");
		expect(result.document.collaboratorId).toBe(collaborator.id);
	});

	it("increments the version on resubmission", async () => {
		const collaborator = await createLinkedSetup();
		const input = {
			collaboratorId: collaborator.id,
			documentTypeId: "type-1",
			fileName: "rg.pdf",
			fileSize: 1024,
			mimeType: "application/pdf",
			buffer: Buffer.from("pdf-content"),
		};

		const first = await useCase.execute(input);
		const second = await useCase.execute(input);

		expect(first.version.versionNumber).toBe(1);
		expect(second.version.versionNumber).toBe(2);
		expect(second.document.id).toBe(first.document.id);
	});

	it("restores a soft-deleted document on resubmission", async () => {
		const collaborator = await createLinkedSetup();
		const input = {
			collaboratorId: collaborator.id,
			documentTypeId: "type-1",
			fileName: "rg.pdf",
			fileSize: 1024,
			mimeType: "application/pdf",
			buffer: Buffer.from("pdf-content"),
		};

		const first = await useCase.execute(input);
		await documentsRepository.softDelete(first.document.id);

		const restored = await useCase.execute(input);

		expect(restored.document.id).toBe(first.document.id);
		expect(restored.document.deletedAt).toBeNull();
		expect(restored.version.versionNumber).toBe(2);
	});

	it("throws a not found error for unknown collaborator", async () => {
		await expect(
			useCase.execute({
				collaboratorId: "missing",
				documentTypeId: "type-1",
				fileName: "rg.pdf",
				fileSize: 1024,
				mimeType: "application/pdf",
				buffer: Buffer.from("pdf-content"),
			}),
		).rejects.toBeInstanceOf(ResourceNotFoundError);
	});

	it("throws a bad request error when collaborator is not linked", async () => {
		const collaborator = await collaboratorsRepository.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed:123",
		});

		await expect(
			useCase.execute({
				collaboratorId: collaborator.id,
				documentTypeId: "type-other",
				fileName: "rg.pdf",
				fileSize: 1024,
				mimeType: "application/pdf",
				buffer: Buffer.from("pdf-content"),
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
