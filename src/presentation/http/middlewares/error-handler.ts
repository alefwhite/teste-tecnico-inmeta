import type { FastifyInstance } from "fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
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
	request.log.error({ err: error });

	if (hasZodFastifySchemaValidationErrors(error)) {
		return reply.status(400).send({
			message: "Erro de validação nos dados fornecidos.",
			errors: toFieldErrors(
				(error.validation ?? []).map((issue) => ({
					path: issue.instancePath.split("/").filter(Boolean),
					message: issue.message ?? "Campo inválido!",
				})),
			),
		});
	}

	if (error instanceof AppError) {
		return reply.status(error.statusCode).send({
			message: error.message,
		});
	}

	return reply.status(500).send({
		message: "Internal server error",
	});
};
