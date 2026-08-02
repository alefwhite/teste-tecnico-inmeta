import { beforeEach, describe, expect, it } from "vitest";
import { UnauthorizedError } from "@/domain/errors/unauthorized-error";
import { FakePasswordHasherProvider } from "@/tests/fakes/fake-password-hasher-provider";
import { FakeTokenProvider } from "@/tests/fakes/fake-token-provider";
import { InMemoryCollaboratorsRepository } from "@/tests/fakes/in-memory-collaborators-repository";
import { LoginUseCase } from "./login.use-case";

describe("LoginUseCase", () => {
	let collaboratorsRepository: InMemoryCollaboratorsRepository;
	let passwordHasher: FakePasswordHasherProvider;
	let useCase: LoginUseCase;

	beforeEach(() => {
		collaboratorsRepository = new InMemoryCollaboratorsRepository();
		passwordHasher = new FakePasswordHasherProvider();
		useCase = new LoginUseCase(
			collaboratorsRepository,
			passwordHasher,
			new FakeTokenProvider(),
		);
	});

	it("returns access and refresh tokens on valid credentials", async () => {
		await collaboratorsRepository.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed:secret123",
		});

		const result = await useCase.execute({
			email: "ana@example.com",
			password: "secret123",
		});

		expect(result.accessToken).toBe(`access:${result.collaborator.id}`);
		expect(result.refreshToken).toBe(`refresh:${result.collaborator.id}`);
		expect(result.collaborator.email).toBe("ana@example.com");
	});

	it("throws an unauthorized error for unknown email", async () => {
		await expect(
			useCase.execute({ email: "missing@example.com", password: "secret" }),
		).rejects.toBeInstanceOf(UnauthorizedError);
	});

	it("throws an unauthorized error for wrong password", async () => {
		await collaboratorsRepository.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed:secret123",
		});

		await expect(
			useCase.execute({ email: "ana@example.com", password: "wrong" }),
		).rejects.toBeInstanceOf(UnauthorizedError);
	});
});
