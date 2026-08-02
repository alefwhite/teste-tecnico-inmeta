import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { ConflictError } from "@/domain/errors/conflict-error";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";

export function mapPrismaError(error: unknown): never {
	if (error instanceof PrismaClientKnownRequestError) {
		if (error.code === "P2002") {
			throw new ConflictError();
		}
		if (error.code === "P2025") {
			throw new ResourceNotFoundError();
		}
	}

	throw error;
}
