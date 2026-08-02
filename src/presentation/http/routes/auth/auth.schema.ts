import z from "zod";

export const loginBodySchema = z.object({
	email: z.email(),
	password: z.string().min(1),
});

export const loginResponseSchema = z.object({
	accessToken: z.string(),
	collaborator: z.object({
		id: z.uuid(),
		name: z.string(),
		email: z.email(),
	}),
});
