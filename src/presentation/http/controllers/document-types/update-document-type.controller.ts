import type { FastifyReply, FastifyRequest } from "fastify";
import { makeUpdateDocumentTypeUseCase } from "@/application/factories/make-document-type-use-cases";
import type { UpdateDocumentTypeUseCaseInput } from "@/application/use-cases/document-types/update-document-type.use-case";
import { DocumentTypeResource } from "@/presentation/http/resource/document-type";

export async function updateDocumentTypeController(
	request: FastifyRequest<{
		Params: { id: string };
		Body: UpdateDocumentTypeUseCaseInput;
	}>,
	reply: FastifyReply,
) {
	const { id } = request.params;

	const useCase = makeUpdateDocumentTypeUseCase();

	const documentType = await useCase.execute(id, request.body);

	return reply.send(DocumentTypeResource.make(documentType));
}
