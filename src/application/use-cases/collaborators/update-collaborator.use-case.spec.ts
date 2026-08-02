import { beforeEach, describe, expect, it } from "vitest";
import { ConflictError } from "@/domain/errors/conflict-error";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import { FakePasswordHasherProvider } from "@/tests/fakes/fake-password-hasher-provider";
import { InMemoryCollaboratorsRepository } from "@/tests/fakes/in-memory-collaborators-repository";
import { UpdateCollaboratorUseCase } from "./update-collaborator.use-case";

describe("UpdateCollaboratorUseCase", () => {
	let collaboratorsRepository: InMemoryCollaboratorsRepository;
	let useCase: UpdateCollaboratorUseCase;

	beforeEach(() => {
		collaboratorsRepository = new InMemoryCollaboratorsRepository();
		useCase = new UpdateCollaboratorUseCase(
			collaboratorsRepository,
			new FakePasswordHasherProvider(),
		);
	});

	async function createCollaborator() {
		return collaboratorsRepository.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed:secret",
		});
	}

	it("updates only the provided fields", async () => {
		const created = await createCollaborator();

		const updated = await useCase.execute(created.id, {
			name: "Ana Oliveira",
		});

		expect(updated.name).toBe("Ana Oliveira");
		expect(updated.email).toBe("ana@example.com");
		expect(updated.password).toBe("hashed:secret");
	});

	it("hashes the password when provided", async () => {
		const created = await createCollaborator();

		const updated = await useCase.execute(created.id, {
			password: "new-secret",
		});

		expect(updated.password).toBe("hashed:new-secret");
	});

	it("throws a conflict when the new email is taken", async () => {
		const created = await createCollaborator();

		await collaboratorsRepository.create({
			name: "Bia Lima",
			email: "bia@example.com",
			password: "hashed:123",
		});

		await expect(
			useCase.execute(created.id, { email: "bia@example.com" }),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it("throws a not found error for unknown id", async () => {
		await expect(
			useCase.execute("missing-id", { name: "X" }),
		).rejects.toBeInstanceOf(ResourceNotFoundError);
	});
});
