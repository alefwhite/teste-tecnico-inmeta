import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getDashboardStatsController } from "@/presentation/http/controllers/stats/get-dashboard-stats.controller";
import { authenticate } from "@/presentation/http/middlewares/authenticate";
import { dashboardStatsResponseSchema } from "@/presentation/http/routes/stats/stats.schema";

export async function statsRoutes(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().route({
		method: "GET",
		url: "/dashboard",
		schema: {
			description: "Get general documentation statistics",
			tags: ["Stats"],
			response: { 200: dashboardStatsResponseSchema },
		},
		preHandler: authenticate,
		handler: getDashboardStatsController,
	});
}
