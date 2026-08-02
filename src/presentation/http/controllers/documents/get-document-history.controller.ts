import type { FastifyReply, FastifyRequest } from "fastify";
import { makeGetDocumentHistoryUseCase } from "@/application/factories/make-document-use-cases";
import { DocumentHistoryResource } from "@/presentation/http/resource/document-history";

export async function getDocumentHistoryController(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const { id } = request.params;

	const useCase = makeGetDocumentHistoryUseCase();

	const history = await useCase.execute(id);

	return reply.send(DocumentHistoryResource.make(history));
}
