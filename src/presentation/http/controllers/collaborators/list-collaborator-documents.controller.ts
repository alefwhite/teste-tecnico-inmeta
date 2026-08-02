import type { FastifyReply, FastifyRequest } from "fastify";
import { makeListCollaboratorDocumentsUseCase } from "@/application/factories/make-document-use-cases";
import { CollaboratorDocumentResource } from "@/presentation/http/resource/collaborator-document";

interface ListCollaboratorDocumentsParams {
	collaboratorId: string;
}

interface ListCollaboratorDocumentsQuery {
	page: number;
	limit: number;
}

export async function listCollaboratorDocumentsController(
	request: FastifyRequest<{
		Params: ListCollaboratorDocumentsParams;
		Querystring: ListCollaboratorDocumentsQuery;
	}>,
	reply: FastifyReply,
) {
	const { collaboratorId } = request.params;
	const { page, limit } = request.query;

	const useCase = makeListCollaboratorDocumentsUseCase();

	const result = await useCase.execute({ collaboratorId, page, limit });

	return reply.send({
		data: result.data.map(CollaboratorDocumentResource.make),
		meta: result.meta,
	});
}
