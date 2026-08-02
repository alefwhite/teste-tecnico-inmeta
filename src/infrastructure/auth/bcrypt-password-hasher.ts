import bcrypt from "bcryptjs";
import type { PasswordHasherProvider } from "@/domain/providers/password-hasher.provider";

export class BcryptPasswordHasher implements PasswordHasherProvider {
	private readonly saltRounds = 10;

	hash(plainPassword: string): Promise<string> {
		return bcrypt.hash(plainPassword, this.saltRounds);
	}

	compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
		return bcrypt.compare(plainPassword, hashedPassword);
	}
}
