import type { FastifyReply, FastifyRequest } from "fastify";
import { makeGetDashboardStatsUseCase } from "@/application/factories/make-stats-use-case";
import { DashboardResource } from "@/presentation/http/resource/dashboard";

export async function getDashboardStatsController(
	_request: FastifyRequest,
	reply: FastifyReply,
) {
	const useCase = makeGetDashboardStatsUseCase();

	const stats = await useCase.execute();

	return reply.send(DashboardResource.make(stats));
}
