import { beforeEach, describe, expect, it } from "vitest";
import { ConflictError } from "@/domain/errors/conflict-error";
import { FakePasswordHasherProvider } from "@/tests/fakes/fake-password-hasher-provider";
import { InMemoryCollaboratorsRepository } from "@/tests/fakes/in-memory-collaborators-repository";
import { CreateCollaboratorUseCase } from "./create-collaborator.use-case";

describe("CreateCollaboratorUseCase", () => {
	let collaboratorsRepository: InMemoryCollaboratorsRepository;
	let useCase: CreateCollaboratorUseCase;

	beforeEach(() => {
		collaboratorsRepository = new InMemoryCollaboratorsRepository();
		useCase = new CreateCollaboratorUseCase(
			collaboratorsRepository,
			new FakePasswordHasherProvider(),
		);
	});

	it("creates a collaborator with a hashed password", async () => {
		const collaborator = await useCase.execute({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "secret123",
		});

		expect(collaborator.email).toBe("ana@example.com");
		expect(collaborator.password).toBe("hashed:secret123");
	});

	it("throws a conflict when email already exists", async () => {
		await useCase.execute({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "secret123",
		});

		await expect(
			useCase.execute({
				name: "Outro Nome",
				email: "ana@example.com",
				password: "secret123",
			}),
		).rejects.toBeInstanceOf(ConflictError);
	});
});
