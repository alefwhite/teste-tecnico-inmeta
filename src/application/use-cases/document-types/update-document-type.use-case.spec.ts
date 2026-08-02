import { beforeEach, describe, expect, it } from "vitest";
import { ConflictError } from "@/domain/errors/conflict-error";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import { InMemoryDocumentTypesRepository } from "@/tests/fakes/in-memory-document-types-repository";
import { UpdateDocumentTypeUseCase } from "./update-document-type.use-case";

describe("UpdateDocumentTypeUseCase", () => {
	let documentTypesRepository: InMemoryDocumentTypesRepository;
	let useCase: UpdateDocumentTypeUseCase;

	beforeEach(() => {
		documentTypesRepository = new InMemoryDocumentTypesRepository();
		useCase = new UpdateDocumentTypeUseCase(documentTypesRepository);
	});

	it("updates name and description", async () => {
		const created = await documentTypesRepository.create({
			name: "RG",
			description: "Registro geral",
		});

		const updated = await useCase.execute(created.id, {
			name: "Identidade",
			description: null,
		});

		expect(updated.name).toBe("Identidade");
		expect(updated.description).toBeNull();
	});

	it("throws a conflict when the new name is taken", async () => {
		const created = await documentTypesRepository.create({ name: "RG" });
		await documentTypesRepository.create({ name: "CPF" });

		await expect(
			useCase.execute(created.id, { name: "CPF" }),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it("throws a not found error for unknown id", async () => {
		await expect(
			useCase.execute("missing-id", { name: "X" }),
		).rejects.toBeInstanceOf(ResourceNotFoundError);
	});
});
