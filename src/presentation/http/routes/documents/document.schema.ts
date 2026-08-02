import z from "zod";
import {
	paginationMetaSchema,
	paginationQuerySchema,
} from "@/presentation/http/schemas/pagination.schema";

export const documentVersionResourceSchema = z.object({
	id: z.uuid(),
	versionNumber: z.number().int(),
	fileName: z.string(),
	fileSize: z.number().int(),
	mimeType: z.string(),
	storageKey: z.string(),
	storageUrl: z.string(),
	createdAt: z.date(),
});

export const documentIdParamsSchema = z.object({
	id: z.uuid(),
});

export const submitDocumentBodySchema = z.any().meta({
	type: "object",
	properties: {
		documentTypeId: {
			type: "string",
			format: "uuid",
			description: "ID do tipo de documento",
		},
		file: {
			type: "string",
			format: "binary",
			description: "Arquivo do documento",
		},
	},
	required: ["documentTypeId", "file"],
});

export const submitDocumentResponseSchema = z.object({
	document: z.object({
		id: z.uuid(),
		collaboratorId: z.uuid(),
		documentTypeId: z.uuid(),
	}),
	version: documentVersionResourceSchema,
});

export const listPendingDocumentsQuerySchema = paginationQuerySchema.extend({
	collaboratorId: z.uuid().optional(),
	documentTypeId: z.uuid().optional(),
	search: z.string().optional(),
});

export const pendingDocumentResourceSchema = z.object({
	collaborator: z.object({
		id: z.uuid(),
		name: z.string(),
		email: z.email(),
	}),
	documentType: z.object({
		id: z.uuid(),
		name: z.string(),
	}),
	linkedAt: z.date(),
});

export const listPendingDocumentsResponseSchema = z.object({
	data: z.array(pendingDocumentResourceSchema),
	meta: paginationMetaSchema,
});

export const documentHistoryResponseSchema = z.object({
	documentId: z.uuid(),
	versions: z.array(documentVersionResourceSchema),
});
