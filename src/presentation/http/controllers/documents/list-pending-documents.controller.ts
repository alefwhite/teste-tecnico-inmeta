import type { FastifyReply, FastifyRequest } from "fastify";
import { makeListPendingDocumentsUseCase } from "@/application/factories/make-document-use-cases";
import { PendingDocumentResource } from "@/presentation/http/resource/pending-document";

interface ListPendingDocumentsQuery {
	page: number;
	limit: number;
	collaboratorId?: string;
	documentTypeId?: string;
	search?: string;
}

export async function listPendingDocumentsController(
	request: FastifyRequest<{ Querystring: ListPendingDocumentsQuery }>,
	reply: FastifyReply,
) {
	const { page, limit, collaboratorId, documentTypeId, search } = request.query;

	const useCase = makeListPendingDocumentsUseCase();

	const result = await useCase.execute({
		page,
		limit,
		collaboratorId,
		documentTypeId,
		search,
	});

	return reply.send({
		data: result.data.map(PendingDocumentResource.make),
		meta: result.meta,
	});
}
