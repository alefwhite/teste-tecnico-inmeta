import z from "zod";

export const createCollaboratorResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	deletedAt: z.string().nullish(),
});

export const createCollaboratorBodySchema = z.object({
	name: z.string(),
	email: z.email(),
	password: z.string(),
});
