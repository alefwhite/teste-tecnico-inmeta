import type { FastifyReply, FastifyRequest } from "fastify";
import { makeDeleteDocumentTypeUseCase } from "@/application/factories/make-document-type-use-cases";

export async function deleteDocumentTypeController(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const { id } = request.params;

	const useCase = makeDeleteDocumentTypeUseCase();

	await useCase.execute(id);

	return reply.status(204).send();
}
