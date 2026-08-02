import { describe, expect, it } from "vitest";
import { BcryptPasswordHasher } from "./bcrypt-password-hasher";

describe("BcryptPasswordHasher", () => {
	const hasher = new BcryptPasswordHasher();

	it("hashes a password", async () => {
		const hash = await hasher.hash("secret123");

		expect(hash).not.toBe("secret123");
		expect(hash).toContain("$2");
	});

	it("compares a correct password", async () => {
		const hash = await hasher.hash("secret123");

		await expect(hasher.compare("secret123", hash)).resolves.toBe(true);
	});

	it("rejects an incorrect password", async () => {
		const hash = await hasher.hash("secret123");

		await expect(hasher.compare("wrong", hash)).resolves.toBe(false);
	});
});
