import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import { InMemoryCollaboratorsRepository } from "@/tests/fakes/in-memory-collaborators-repository";
import { GetCollaboratorUseCase } from "./get-collaborator.use-case";

describe("GetCollaboratorUseCase", () => {
	let collaboratorsRepository: InMemoryCollaboratorsRepository;
	let useCase: GetCollaboratorUseCase;

	beforeEach(() => {
		collaboratorsRepository = new InMemoryCollaboratorsRepository();
		useCase = new GetCollaboratorUseCase(collaboratorsRepository);
	});

	it("returns the collaborator by id", async () => {
		const created = await collaboratorsRepository.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed:123",
		});

		const collaborator = await useCase.execute(created.id);

		expect(collaborator.id).toBe(created.id);
		expect(collaborator.name).toBe("Ana Souza");
	});

	it("throws a not found error for unknown id", async () => {
		await expect(useCase.execute("missing-id")).rejects.toBeInstanceOf(
			ResourceNotFoundError,
		);
	});

	it("throws a not found error for soft-deleted collaborator", async () => {
		const created = await collaboratorsRepository.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed:123",
		});

		created.softDelete();

		await expect(useCase.execute(created.id)).rejects.toBeInstanceOf(
			ResourceNotFoundError,
		);
	});
});
