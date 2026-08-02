import { AppError } from "@/domain/errors/app-error";

export class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized") {
		super(message, 401);
	}
}
