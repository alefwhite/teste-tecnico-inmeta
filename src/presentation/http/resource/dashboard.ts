import type { DashboardStats } from "@/domain/repositories/stats.repository";

export class DashboardResource {
	static make(stats: DashboardStats) {
		return {
			completionRate: stats.completionRate,
			totalLinks: stats.totalLinks,
			completedLinks: stats.completedLinks,
			topPendingDocumentTypes: stats.topPendingDocumentTypes,
			recentSubmissions: stats.recentSubmissions.map((submission) => ({
				version: {
					id: submission.version.id,
					versionNumber: submission.version.versionNumber,
					fileName: submission.version.fileName,
					fileSize: submission.version.fileSize,
					mimeType: submission.version.mimeType,
					createdAt: submission.version.createdAt,
				},
				collaborator: submission.collaborator,
				documentType: submission.documentType,
			})),
		};
	}
}
