import type { PasswordHasherProvider } from "@/domain/providers/password-hasher.provider";

export class FakePasswordHasherProvider implements PasswordHasherProvider {
	async hash(plainPassword: string): Promise<string> {
		return `hashed:${plainPassword}`;
	}

	async compare(
		plainPassword: string,
		hashedPassword: string,
	): Promise<boolean> {
		return hashedPassword === `hashed:${plainPassword}`;
	}
}
