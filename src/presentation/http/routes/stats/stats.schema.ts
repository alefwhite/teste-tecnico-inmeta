import z from "zod";

export const dashboardStatsResponseSchema = z.object({
	completionRate: z.number().nullable(),
	totalLinks: z.number().int(),
	completedLinks: z.number().int(),
	topPendingDocumentTypes: z.array(
		z.object({
			documentTypeId: z.uuid(),
			name: z.string(),
			pendingCount: z.number().int(),
		}),
	),
	recentSubmissions: z.array(
		z.object({
			version: z.object({
				id: z.uuid(),
				versionNumber: z.number().int(),
				fileName: z.string(),
				fileSize: z.number().int(),
				mimeType: z.string(),
				createdAt: z.date(),
			}),
			collaborator: z.object({
				id: z.uuid(),
				name: z.string(),
			}),
			documentType: z.object({
				id: z.uuid(),
				name: z.string(),
			}),
		}),
	),
});
