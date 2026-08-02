import type { DocumentVersion } from "@/domain/entities/document-version.entity";

export interface TopPendingDocumentType {
	documentTypeId: string;
	name: string;
	pendingCount: number;
}

export interface RecentSubmission {
	version: DocumentVersion;
	collaborator: {
		id: string;
		name: string;
	};
	documentType: {
		id: string;
		name: string;
	};
}

export interface DashboardStats {
	completionRate: number | null;
	totalLinks: number;
	completedLinks: number;
	topPendingDocumentTypes: TopPendingDocumentType[];
	recentSubmissions: RecentSubmission[];
}

export interface StatsRepository {
	getDashboardStats(): Promise<DashboardStats>;
}
