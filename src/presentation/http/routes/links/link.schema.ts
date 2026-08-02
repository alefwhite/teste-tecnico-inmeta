import z from "zod";

export const linkCollaboratorParamsSchema = z.object({
	collaboratorId: z.uuid(),
});

export const linkParamsSchema = z.object({
	collaboratorId: z.uuid(),
	documentTypeId: z.uuid(),
});

export const linkDocumentTypeBodySchema = z.object({
	documentTypeId: z.uuid(),
});

export const linkResourceSchema = z.object({
	id: z.uuid(),
	collaboratorId: z.uuid(),
	documentTypeId: z.uuid(),
	createdAt: z.date(),
});
