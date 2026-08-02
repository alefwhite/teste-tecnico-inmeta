import { AppError } from "@/domain/errors/app-error";

export class BadRequestError extends AppError {
	constructor(message = "Bad request") {
		super(message, 400);
	}
}
