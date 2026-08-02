import type { FastifyReply, FastifyRequest } from "fastify";
import { makeLinkCollaboratorToDocumentTypeUseCase } from "@/application/factories/make-link-use-cases";
import { LinkResource } from "@/presentation/http/resource/link";

export async function linkCollaboratorToDocumentTypeController(
	request: FastifyRequest<{
		Params: { collaboratorId: string };
		Body: { documentTypeId: string };
	}>,
	reply: FastifyReply,
) {
	const { collaboratorId } = request.params;

	const useCase = makeLinkCollaboratorToDocumentTypeUseCase();

	const link = await useCase.execute({
		collaboratorId,
		documentTypeId: request.body.documentTypeId,
	});

	return reply.status(201).send(LinkResource.make(link));
}
