import type { FastifyReply, FastifyRequest } from "fastify";
import { makeCreateCollaboratorUseCase } from "@/application/factories/make-collaborator-use-cases";
import type { CreateCollaboratorUseCaseInput } from "@/application/use-cases/collaborators/create-collaborator.use-case";
import { CollaboratorResource } from "@/presentation/http/resource/collaborator";

export async function createCollaboratorController(
	request: FastifyRequest<{ Body: CreateCollaboratorUseCaseInput }>,
	reply: FastifyReply,
) {
	const body = request.body;

	const collaboratorUseCase = makeCreateCollaboratorUseCase();

	const collaborator = await collaboratorUseCase.execute(body);

	return reply.status(201).send(CollaboratorResource.make(collaborator));
}
