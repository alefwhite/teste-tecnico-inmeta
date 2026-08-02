import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCollaboratorsRepository } from "@/tests/fakes/in-memory-collaborators-repository";
import { ListCollaboratorsUseCase } from "./list-collaborators.use-case";

describe("ListCollaboratorsUseCase", () => {
	let collaboratorsRepository: InMemoryCollaboratorsRepository;
	let useCase: ListCollaboratorsUseCase;

	beforeEach(() => {
		collaboratorsRepository = new InMemoryCollaboratorsRepository();
		useCase = new ListCollaboratorsUseCase(collaboratorsRepository);
	});

	it("paginates collaborators sorted by name", async () => {
		await collaboratorsRepository.create({
			name: "Zeca",
			email: "zeca@example.com",
			password: "hashed:123",
		});
		await collaboratorsRepository.create({
			name: "Ana",
			email: "ana@example.com",
			password: "hashed:123",
		});
		await collaboratorsRepository.create({
			name: "Bia",
			email: "bia@example.com",
			password: "hashed:123",
		});

		const firstPage = await useCase.execute({ page: 1, limit: 2 });

		expect(firstPage.data.map((item) => item.name)).toEqual(["Ana", "Bia"]);
		expect(firstPage.meta).toMatchObject({
			page: 1,
			limit: 2,
			total: 3,
			totalPages: 2,
		});

		const secondPage = await useCase.execute({ page: 2, limit: 2 });

		expect(secondPage.data.map((item) => item.name)).toEqual(["Zeca"]);
	});

	it("filters by search term", async () => {
		await collaboratorsRepository.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed:123",
		});
		await collaboratorsRepository.create({
			name: "Bia Lima",
			email: "bia@example.com",
			password: "hashed:123",
		});

		const result = await useCase.execute({
			page: 1,
			limit: 10,
			search: "souza",
		});

		expect(result.data).toHaveLength(1);
		expect(result.data[0].name).toBe("Ana Souza");
	});

	it("excludes soft-deleted collaborators", async () => {
		const collaborator = await collaboratorsRepository.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed:123",
		});

		collaborator.softDelete();

		const result = await useCase.execute({ page: 1, limit: 10 });

		expect(result.data).toHaveLength(0);
		expect(result.meta.total).toBe(0);
	});
});
