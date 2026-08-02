import { beforeEach, describe, expect, it } from "vitest";
import { ConflictError } from "@/domain/errors/conflict-error";
import { InMemoryDocumentTypesRepository } from "@/tests/fakes/in-memory-document-types-repository";
import { CreateDocumentTypeUseCase } from "./create-document-type.use-case";

describe("CreateDocumentTypeUseCase", () => {
	let documentTypesRepository: InMemoryDocumentTypesRepository;
	let useCase: CreateDocumentTypeUseCase;

	beforeEach(() => {
		documentTypesRepository = new InMemoryDocumentTypesRepository();
		useCase = new CreateDocumentTypeUseCase(documentTypesRepository);
	});

	it("creates a document type", async () => {
		const documentType = await useCase.execute({
			name: "RG",
			description: "Registro geral",
		});

		expect(documentType.name).toBe("RG");
		expect(documentType.description).toBe("Registro geral");
	});

	it("throws a conflict when name already exists", async () => {
		await useCase.execute({ name: "RG" });

		await expect(useCase.execute({ name: "RG" })).rejects.toBeInstanceOf(
			ConflictError,
		);
	});
});
