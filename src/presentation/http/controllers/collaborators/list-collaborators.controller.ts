import type { FastifyReply, FastifyRequest } from "fastify";
import { makeListCollaboratorsUseCase } from "@/application/factories/make-collaborator-use-cases";
import { CollaboratorResource } from "@/presentation/http/resource/collaborator";

interface ListCollaboratorsQuery {
	page: number;
	limit: number;
	search?: string;
}

export async function listCollaboratorsController(
	request: FastifyRequest<{ Querystring: ListCollaboratorsQuery }>,
	reply: FastifyReply,
) {
	const { page, limit, search } = request.query;

	const useCase = makeListCollaboratorsUseCase();

	const result = await useCase.execute({ page, limit, search });

	return reply.send({
		data: result.data.map(CollaboratorResource.make),
		meta: result.meta,
	});
}
