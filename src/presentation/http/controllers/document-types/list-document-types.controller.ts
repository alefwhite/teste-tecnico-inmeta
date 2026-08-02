import type { FastifyReply, FastifyRequest } from "fastify";
import { makeListDocumentTypesUseCase } from "@/application/factories/make-document-type-use-cases";
import { DocumentTypeResource } from "@/presentation/http/resource/document-type";

export async function listDocumentTypesController(
	_request: FastifyRequest,
	reply: FastifyReply,
) {
	const useCase = makeListDocumentTypesUseCase();

	const documentTypes = await useCase.execute();

	return reply.send({ data: documentTypes.map(DocumentTypeResource.make) });
}
