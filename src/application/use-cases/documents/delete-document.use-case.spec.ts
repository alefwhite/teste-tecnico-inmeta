import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import { InMemoryDocumentsRepository } from "@/tests/fakes/in-memory-documents-repository";
import { DeleteDocumentUseCase } from "./delete-document.use-case";

describe("DeleteDocumentUseCase", () => {
	let documentsRepository: InMemoryDocumentsRepository;
	let useCase: DeleteDocumentUseCase;

	beforeEach(() => {
		documentsRepository = new InMemoryDocumentsRepository();
		useCase = new DeleteDocumentUseCase(documentsRepository);
	});

	it("soft deletes the document", async () => {
		const created = await documentsRepository.submit({
			collaboratorId: "collaborator-1",
			documentTypeId: "type-1",
			fileName: "rg.pdf",
			fileSize: 1024,
			mimeType: "application/pdf",
			storageKey: "fake/rg.pdf",
			storageUrl: "/uploads/fake/rg.pdf",
		});

		const deleted = await useCase.execute(created.document.id);

		expect(deleted.deletedAt).toBeInstanceOf(Date);
		await expect(
			documentsRepository.findById(created.document.id),
		).resolves.toBeNull();
	});

	it("throws a not found error for unknown id", async () => {
		await expect(useCase.execute("missing-id")).rejects.toBeInstanceOf(
			ResourceNotFoundError,
		);
	});
});
