import { GetDashboardStatsUseCase } from "@/application/use-cases/stats/get-dashboard-stats.use-case";
import { PrismaStatsRepository } from "@/infrastructure/database/repositories/prisma/prisma-stats-repository";

export const makeGetDashboardStatsUseCase = () =>
	new GetDashboardStatsUseCase(new PrismaStatsRepository());
