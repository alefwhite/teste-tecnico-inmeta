import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryDocumentTypesRepository } from "@/tests/fakes/in-memory-document-types-repository";
import { ListDocumentTypesUseCase } from "./list-document-types.use-case";

describe("ListDocumentTypesUseCase", () => {
	let documentTypesRepository: InMemoryDocumentTypesRepository;
	let useCase: ListDocumentTypesUseCase;

	beforeEach(() => {
		documentTypesRepository = new InMemoryDocumentTypesRepository();
		useCase = new ListDocumentTypesUseCase(documentTypesRepository);
	});

	it("returns document types sorted by name", async () => {
		await documentTypesRepository.create({ name: "CPF" });
		await documentTypesRepository.create({ name: "RG" });

		const result = await useCase.execute();

		expect(result.map((item) => item.name)).toEqual(["CPF", "RG"]);
	});

	it("excludes soft-deleted document types", async () => {
		const created = await documentTypesRepository.create({ name: "CPF" });
		await documentTypesRepository.create({ name: "RG" });

		created.softDelete();

		const result = await useCase.execute();

		expect(result.map((item) => item.name)).toEqual(["RG"]);
	});
});
