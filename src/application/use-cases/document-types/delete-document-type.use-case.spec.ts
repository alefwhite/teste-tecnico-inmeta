import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import { InMemoryDocumentTypesRepository } from "@/tests/fakes/in-memory-document-types-repository";
import { DeleteDocumentTypeUseCase } from "./delete-document-type.use-case";

describe("DeleteDocumentTypeUseCase", () => {
	let documentTypesRepository: InMemoryDocumentTypesRepository;
	let useCase: DeleteDocumentTypeUseCase;

	beforeEach(() => {
		documentTypesRepository = new InMemoryDocumentTypesRepository();
		useCase = new DeleteDocumentTypeUseCase(documentTypesRepository);
	});

	it("soft deletes the document type", async () => {
		const created = await documentTypesRepository.create({ name: "RG" });

		const deleted = await useCase.execute(created.id);

		expect(deleted.deletedAt).toBeInstanceOf(Date);
		await expect(
			documentTypesRepository.findById(created.id),
		).resolves.toBeNull();
	});

	it("throws a not found error for unknown id", async () => {
		await expect(useCase.execute("missing-id")).rejects.toBeInstanceOf(
			ResourceNotFoundError,
		);
	});
});
