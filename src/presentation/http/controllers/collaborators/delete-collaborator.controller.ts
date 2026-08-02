import type { FastifyReply, FastifyRequest } from "fastify";
import { makeDeleteCollaboratorUseCase } from "@/application/factories/make-collaborator-use-cases";

export async function deleteCollaboratorController(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const { id } = request.params;

	const useCase = makeDeleteCollaboratorUseCase();

	await useCase.execute(id);

	return reply.status(204).send();
}
