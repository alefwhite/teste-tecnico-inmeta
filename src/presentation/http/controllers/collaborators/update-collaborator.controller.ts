import type { FastifyReply, FastifyRequest } from "fastify";
import { makeUpdateCollaboratorUseCase } from "@/application/factories/make-collaborator-use-cases";
import type { UpdateCollaboratorUseCaseInput } from "@/application/use-cases/collaborators/update-collaborator.use-case";
import { CollaboratorResource } from "@/presentation/http/resource/collaborator";

export async function updateCollaboratorController(
	request: FastifyRequest<{
		Params: { id: string };
		Body: UpdateCollaboratorUseCaseInput;
	}>,
	reply: FastifyReply,
) {
	const { id } = request.params;

	const useCase = makeUpdateCollaboratorUseCase();

	const collaborator = await useCase.execute(id, request.body);

	return reply.send(CollaboratorResource.make(collaborator));
}
