import type { FastifyReply, FastifyRequest } from "fastify";
import { makeCreateDocumentTypeUseCase } from "@/application/factories/make-document-type-use-cases";
import type { CreateDocumentTypeUseCaseInput } from "@/application/use-cases/document-types/create-document-type.use-case";
import { DocumentTypeResource } from "@/presentation/http/resource/document-type";

export async function createDocumentTypeController(
	request: FastifyRequest<{ Body: CreateDocumentTypeUseCaseInput }>,
	reply: FastifyReply,
) {
	const useCase = makeCreateDocumentTypeUseCase();

	const documentType = await useCase.execute(request.body);

	return reply.status(201).send(DocumentTypeResource.make(documentType));
}
