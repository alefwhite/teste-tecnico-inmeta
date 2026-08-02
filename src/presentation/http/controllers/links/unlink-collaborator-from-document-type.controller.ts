import type { FastifyReply, FastifyRequest } from "fastify";
import { makeUnlinkCollaboratorFromDocumentTypeUseCase } from "@/application/factories/make-link-use-cases";

export async function unlinkCollaboratorFromDocumentTypeController(
	request: FastifyRequest<{
		Params: { collaboratorId: string; documentTypeId: string };
	}>,
	reply: FastifyReply,
) {
	const { collaboratorId, documentTypeId } = request.params;

	const useCase = makeUnlinkCollaboratorFromDocumentTypeUseCase();

	await useCase.execute(collaboratorId, documentTypeId);

	return reply.status(204).send();
}
