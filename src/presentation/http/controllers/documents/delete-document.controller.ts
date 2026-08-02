import type { FastifyReply, FastifyRequest } from "fastify";
import { makeDeleteDocumentUseCase } from "@/application/factories/make-document-use-cases";

export async function deleteDocumentController(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const { id } = request.params;

	const useCase = makeDeleteDocumentUseCase();

	await useCase.execute(id);

	return reply.status(204).send();
}
