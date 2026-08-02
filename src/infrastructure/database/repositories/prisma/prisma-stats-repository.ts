import { DocumentVersion } from "@/domain/entities/document-version.entity";
import type {
	DashboardStats,
	StatsRepository,
	TopPendingDocumentType,
} from "@/domain/repositories/stats.repository";
import { prisma } from "@/infrastructure/database/prisma";

interface CompletionRow {
	totalLinks: bigint;
	completedLinks: bigint;
}

interface TopPendingRow {
	documentTypeId: string;
	name: string;
	pendingCount: bigint;
}

interface RecentSubmissionRow {
	versionId: string;
	documentId: string;
	versionNumber: number;
	fileName: string;
	fileSize: number;
	mimeType: string;
	storageKey: string;
	storageUrl: string;
	createdAt: Date;
	collaboratorId: string;
	collaboratorName: string;
	documentTypeId: string;
	documentTypeName: string;
}

export class PrismaStatsRepository implements StatsRepository {
	async getDashboardStats(): Promise<DashboardStats> {
		const [completionRows, topPendingRows, recentRows] = await Promise.all([
			prisma.$queryRaw<CompletionRow[]>`
				SELECT
					COUNT(*)::bigint AS "totalLinks",
					COUNT(d.id)::bigint AS "completedLinks"
				FROM collaborator_document_types cdt
				JOIN collaborators c ON c.id = cdt.collaborator_id AND c.deleted_at IS NULL
				JOIN document_types dt ON dt.id = cdt.document_type_id AND dt.deleted_at IS NULL
				LEFT JOIN documents d
					ON d.collaborator_id = cdt.collaborator_id
					AND d.document_type_id = cdt.document_type_id
					AND d.deleted_at IS NULL
			`,
			prisma.$queryRaw<TopPendingRow[]>`
				SELECT
					dt.id AS "documentTypeId",
					dt.name AS "name",
					COUNT(*)::bigint AS "pendingCount"
				FROM collaborator_document_types cdt
				JOIN collaborators c ON c.id = cdt.collaborator_id AND c.deleted_at IS NULL
				JOIN document_types dt ON dt.id = cdt.document_type_id AND dt.deleted_at IS NULL
				LEFT JOIN documents d
					ON d.collaborator_id = cdt.collaborator_id
					AND d.document_type_id = cdt.document_type_id
					AND d.deleted_at IS NULL
				WHERE d.id IS NULL
				GROUP BY dt.id, dt.name
				ORDER BY "pendingCount" DESC
				LIMIT 5
			`,
			prisma.$queryRaw<RecentSubmissionRow[]>`
				SELECT
					dv.id AS "versionId",
					dv.document_id AS "documentId",
					dv.version_number AS "versionNumber",
					dv.file_name AS "fileName",
					dv.file_size AS "fileSize",
					dv.mime_type AS "mimeType",
					dv.storage_key AS "storageKey",
					dv.storage_url AS "storageUrl",
					dv.created_at AS "createdAt",
					c.id AS "collaboratorId",
					c.name AS "collaboratorName",
					dt.id AS "documentTypeId",
					dt.name AS "documentTypeName"
				FROM document_versions dv
				JOIN documents d ON d.id = dv.document_id AND d.deleted_at IS NULL
				JOIN collaborators c ON c.id = d.collaborator_id AND c.deleted_at IS NULL
				JOIN document_types dt ON dt.id = d.document_type_id AND dt.deleted_at IS NULL
				ORDER BY dv.created_at DESC
				LIMIT 10
			`,
		]);

		const { totalLinks, completedLinks } = completionRows[0] ?? {
			totalLinks: 0n,
			completedLinks: 0n,
		};

		const completionRate =
			totalLinks === 0n
				? null
				: Number(((completedLinks * 10000n) / totalLinks).toString()) / 100;

		return {
			completionRate,
			totalLinks: Number(totalLinks),
			completedLinks: Number(completedLinks),
			topPendingDocumentTypes: topPendingRows.map<TopPendingDocumentType>(
				(row) => ({
					documentTypeId: row.documentTypeId,
					name: row.name,
					pendingCount: Number(row.pendingCount),
				}),
			),
			recentSubmissions: recentRows.map((row) => ({
				version: new DocumentVersion({
					id: row.versionId,
					documentId: row.documentId,
					versionNumber: row.versionNumber,
					fileName: row.fileName,
					fileSize: row.fileSize,
					mimeType: row.mimeType,
					storageKey: row.storageKey,
					storageUrl: row.storageUrl,
					createdAt: row.createdAt,
				}),
				collaborator: {
					id: row.collaboratorId,
					name: row.collaboratorName,
				},
				documentType: {
					id: row.documentTypeId,
					name: row.documentTypeName,
				},
			})),
		};
	}
}
