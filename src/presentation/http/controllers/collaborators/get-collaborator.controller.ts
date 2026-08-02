import type { FastifyReply, FastifyRequest } from "fastify";
import { makeGetCollaboratorUseCase } from "@/application/factories/make-collaborator-use-cases";
import { CollaboratorResource } from "@/presentation/http/resource/collaborator";

export async function getCollaboratorController(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const { id } = request.params;

	const useCase = makeGetCollaboratorUseCase();

	const collaborator = await useCase.execute(id);

	return reply.send(CollaboratorResource.make(collaborator));
}
