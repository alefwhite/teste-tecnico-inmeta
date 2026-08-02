import { AppError } from "@/domain/errors/app-error";

export class ResourceNotFoundError extends AppError {
	constructor(message = "Resource not found") {
		super(message, 404);
	}
}
