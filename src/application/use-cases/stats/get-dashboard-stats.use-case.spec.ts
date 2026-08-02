import { beforeEach, describe, expect, it } from "vitest";
import type { DashboardStats } from "@/domain/repositories/stats.repository";
import { InMemoryStatsRepository } from "@/tests/fakes/in-memory-stats-repository";
import { GetDashboardStatsUseCase } from "./get-dashboard-stats.use-case";

describe("GetDashboardStatsUseCase", () => {
	let statsRepository: InMemoryStatsRepository;
	let useCase: GetDashboardStatsUseCase;

	beforeEach(() => {
		statsRepository = new InMemoryStatsRepository();
		useCase = new GetDashboardStatsUseCase(statsRepository);
	});

	it("returns the dashboard stats from the repository", async () => {
		const stats: DashboardStats = {
			completionRate: 50,
			totalLinks: 4,
			completedLinks: 2,
			topPendingDocumentTypes: [
				{ documentTypeId: "t-1", name: "RG", pendingCount: 3 },
			],
			recentSubmissions: [],
		};

		statsRepository.setStats(stats);

		await expect(useCase.execute()).resolves.toEqual(stats);
	});
});
