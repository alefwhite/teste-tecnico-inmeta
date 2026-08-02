import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import { InMemoryCollaboratorsRepository } from "@/tests/fakes/in-memory-collaborators-repository";
import { DeleteCollaboratorUseCase } from "./delete-collaborator.use-case";

describe("DeleteCollaboratorUseCase", () => {
	let collaboratorsRepository: InMemoryCollaboratorsRepository;
	let useCase: DeleteCollaboratorUseCase;

	beforeEach(() => {
		collaboratorsRepository = new InMemoryCollaboratorsRepository();
		useCase = new DeleteCollaboratorUseCase(collaboratorsRepository);
	});

	it("soft deletes the collaborator", async () => {
		const created = await collaboratorsRepository.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed:123",
		});

		const deleted = await useCase.execute(created.id);

		expect(deleted.deletedAt).toBeInstanceOf(Date);
		await expect(
			collaboratorsRepository.findById(created.id),
		).resolves.toBeNull();
	});

	it("throws a not found error for unknown id", async () => {
		await expect(useCase.execute("missing-id")).rejects.toBeInstanceOf(
			ResourceNotFoundError,
		);
	});
});
