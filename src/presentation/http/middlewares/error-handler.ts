import type { FastifyInstance } from "fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { AppError } from "@/domain/errors/app-error";

type FieldErrors = Record<string, string[]>;

function toFieldErrors(
	issues: { path: string[]; message: string }[],
): FieldErrors {
	return issues.reduce<FieldErrors>((acc, issue) => {
		const field = issue.path.join(".");

		acc[field] ??= [];
		acc[field].push(issue.message);

		return acc;
	}, {});
}

export const errorHandler: FastifyInstance["errorHandler"] = (
	error,
	request,
	reply,
) => {
	if (error instanceof ZodError) {
		return reply.status(400).send({
			message: "Erro de validação nos dados fornecidos.",
			errors: toFieldErrors(
				error.issues.map((issue) => ({
					path: issue.path.map(String),
					message: issue.message,
				})),
			),
		});
	}

	if (hasZodFastifySchemaValidationErrors(error)) {
		return reply.status(400).send({
			message: "Erro de validação nos dados fornecidos.",
			errors: toFieldErrors(
				(error.validation ?? []).map((issue) => ({
					path: issue.instancePath.split("/").filter(Boolean),
					message: issue.message ?? "Invalid input",
				})),
			),
		});
	}

	if (error instanceof AppError) {
		return reply.status(error.statusCode).send({
			message: error.message,
		});
	}

	request.log.error({ err: error });

	return reply.status(500).send({
		message: "Internal server error",
	});
};
