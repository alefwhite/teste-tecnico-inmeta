import z from "zod";

export const documentTypeResourceSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	description: z.string().nullable(),
});

export const documentTypeIdParamsSchema = z.object({
	id: z.uuid(),
});

export const createDocumentTypeBodySchema = z.object({
	name: z.string().min(1),
	description: z.string().nullable().optional(),
});

export const updateDocumentTypeBodySchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().nullable().optional(),
});

export const listDocumentTypesResponseSchema = z.object({
	data: z.array(documentTypeResourceSchema),
});
