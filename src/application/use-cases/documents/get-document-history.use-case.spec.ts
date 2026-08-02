import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import { InMemoryDocumentsRepository } from "@/tests/fakes/in-memory-documents-repository";
import { GetDocumentHistoryUseCase } from "./get-document-history.use-case";

describe("GetDocumentHistoryUseCase", () => {
	let documentsRepository: InMemoryDocumentsRepository;
	let useCase: GetDocumentHistoryUseCase;

	beforeEach(() => {
		documentsRepository = new InMemoryDocumentsRepository();
		useCase = new GetDocumentHistoryUseCase(documentsRepository);
	});

	it("returns the document with all versions in order", async () => {
		const created = await documentsRepository.submit({
			collaboratorId: "collaborator-1",
			documentTypeId: "type-1",
			fileName: "rg.pdf",
			fileSize: 1024,
			mimeType: "application/pdf",
			storageKey: "fake/rg.pdf",
			storageUrl: "/uploads/fake/rg.pdf",
		});

		await documentsRepository.submit({
			collaboratorId: "collaborator-1",
			documentTypeId: "type-1",
			fileName: "rg-v2.pdf",
			fileSize: 2048,
			mimeType: "application/pdf",
			storageKey: "fake/rg.pdf",
			storageUrl: "/uploads/fake/rg.pdf",
		});

		const result = await useCase.execute(created.document.id);

		expect(result.document.id).toBe(created.document.id);
		expect(result.versions).toHaveLength(2);
		expect(result.versions.map((version) => version.versionNumber)).toEqual([
			1, 2,
		]);
	});

	it("throws a not found error for unknown document", async () => {
		await expect(useCase.execute("missing-id")).rejects.toBeInstanceOf(
			ResourceNotFoundError,
		);
	});

	it("throws a not found error for soft-deleted document", async () => {
		const created = await documentsRepository.submit({
			collaboratorId: "collaborator-1",
			documentTypeId: "type-1",
			fileName: "rg.pdf",
			fileSize: 1024,
			mimeType: "application/pdf",
			storageKey: "fake/rg.pdf",
			storageUrl: "/uploads/fake/rg.pdf",
		});

		await documentsRepository.softDelete(created.document.id);

		await expect(useCase.execute(created.document.id)).rejects.toBeInstanceOf(
			ResourceNotFoundError,
		);
	});
});
