import z from "zod";
import {
	paginationMetaSchema,
	paginationQuerySchema,
} from "@/presentation/http/schemas/pagination.schema";

export const collaboratorResourceSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	email: z.email(),
});

export const collaboratorIdParamsSchema = z.object({
	id: z.uuid(),
});

export const createCollaboratorBodySchema = z.object({
	name: z.string().min(1),
	email: z.email(),
	password: z.string().min(6),
});

export const updateCollaboratorBodySchema = z.object({
	name: z.string().min(1).optional(),
	email: z.email().optional(),
	password: z.string().min(6).optional(),
});

export const listCollaboratorsQuerySchema = paginationQuerySchema.extend({
	search: z.string().optional(),
});

export const createCollaboratorResponseSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	email: z.email(),
});

export const listCollaboratorsResponseSchema = z.object({
	data: z.array(collaboratorResourceSchema),
	meta: paginationMetaSchema,
});
