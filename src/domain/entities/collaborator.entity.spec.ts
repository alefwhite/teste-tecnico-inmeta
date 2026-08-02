import { describe, expect, it } from "vitest";
import { Collaborator } from "./collaborator.entity";

describe("Collaborator", () => {
	it("creates a collaborator with generated id and dates", () => {
		const collaborator = Collaborator.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed-password",
		});

		expect(collaborator.id).toBeTruthy();
		expect(collaborator.name).toBe("Ana Souza");
		expect(collaborator.email).toBe("ana@example.com");
		expect(collaborator.password).toBe("hashed-password");
		expect(collaborator.createdAt).toBeInstanceOf(Date);
		expect(collaborator.updatedAt).toBeInstanceOf(Date);
		expect(collaborator.deletedAt).toBeNull();
	});

	it("updates fields and refreshes updatedAt", () => {
		const collaborator = Collaborator.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed-password",
		});

		const previousUpdatedAt = collaborator.updatedAt;

		collaborator.update({ name: "Ana Oliveira" });

		expect(collaborator.name).toBe("Ana Oliveira");
		expect(collaborator.updatedAt.getTime()).toBeGreaterThanOrEqual(
			previousUpdatedAt.getTime(),
		);
	});

	it("does not override password when absent in update", () => {
		const collaborator = Collaborator.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed-password",
		});

		collaborator.update({ email: "new@example.com" });

		expect(collaborator.password).toBe("hashed-password");
	});

	it("soft deletes by setting deletedAt", () => {
		const collaborator = Collaborator.create({
			name: "Ana Souza",
			email: "ana@example.com",
			password: "hashed-password",
		});

		collaborator.softDelete();

		expect(collaborator.deletedAt).toBeInstanceOf(Date);
	});
});
