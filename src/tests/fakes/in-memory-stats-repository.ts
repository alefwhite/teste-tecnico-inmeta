import type {
	DashboardStats,
	StatsRepository,
} from "@/domain/repositories/stats.repository";

export class InMemoryStatsRepository implements StatsRepository {
	private stats: DashboardStats = {
		completionRate: null,
		totalLinks: 0,
		completedLinks: 0,
		topPendingDocumentTypes: [],
		recentSubmissions: [],
	};

	setStats(stats: DashboardStats): void {
		this.stats = stats;
	}

	async getDashboardStats(): Promise<DashboardStats> {
		return this.stats;
	}
}
