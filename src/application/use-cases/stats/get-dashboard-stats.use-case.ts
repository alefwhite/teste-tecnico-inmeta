import type { StatsRepository } from "@/domain/repositories/stats.repository";

export class GetDashboardStatsUseCase {
	constructor(private statsRepository: StatsRepository) {}

	execute() {
		return this.statsRepository.getDashboardStats();
	}
}
