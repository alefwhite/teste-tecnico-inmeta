import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createCollaboratorController } from "@/presentation/http/controllers/collaborators/create-collaborator.controller";
import { deleteCollaboratorController } from "@/presentation/http/controllers/collaborators/delete-collaborator.controller";
import { getCollaboratorController } from "@/presentation/http/controllers/collaborators/get-collaborator.controller";
import { listCollaboratorsController } from "@/presentation/http/controllers/collaborators/list-collaborators.controller";
import { updateCollaboratorController } from "@/presentation/http/controllers/collaborators/update-collaborator.controller";
import { authenticate } from "@/presentation/http/middlewares/authenticate";
import {
	collaboratorIdParamsSchema,
	createCollaboratorBodySchema,
	createCollaboratorResponseSchema,
	listCollaboratorsQuerySchema,
	listCollaboratorsResponseSchema,
	updateCollaboratorBodySchema,
} from "@/presentation/http/routes/collaborators/collaborator.schema";

export async function collaboratorsRoutes(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().route({
		method: "POST",
		url: "/",
		schema: {
			description: "Create a new collaborator",
			tags: ["Collaborators"],
			body: createCollaboratorBodySchema,
			response: { 201: createCollaboratorResponseSchema },
		},
		handler: createCollaboratorController,
	});

	app.withTypeProvider<ZodTypeProvider>().route({
		method: "GET",
		url: "/",
		schema: {
			description: "List collaborators",
			tags: ["Collaborators"],
			querystring: listCollaboratorsQuerySchema,
			response: { 200: listCollaboratorsResponseSchema },
		},
		preHandler: authenticate,
		handler: listCollaboratorsController,
	});

	app.withTypeProvider<ZodTypeProvider>().route({
		method: "GET",
		url: "/:id",
		schema: {
			description: "Get a collaborator by id",
			tags: ["Collaborators"],
			params: collaboratorIdParamsSchema,
			response: { 200: createCollaboratorResponseSchema },
		},
		preHandler: authenticate,
		handler: getCollaboratorController,
	});

	app.withTypeProvider<ZodTypeProvider>().route({
		method: "PATCH",
		url: "/:id",
		schema: {
			description: "Update a collaborator",
			tags: ["Collaborators"],
			params: collaboratorIdParamsSchema,
			body: updateCollaboratorBodySchema,
			response: { 200: createCollaboratorResponseSchema },
		},
		preHandler: authenticate,
		handler: updateCollaboratorController,
	});

	app.withTypeProvider<ZodTypeProvider>().route({
		method: "DELETE",
		url: "/:id",
		schema: {
			description: "Soft delete a collaborator",
			tags: ["Collaborators"],
			params: collaboratorIdParamsSchema,
		},
		preHandler: authenticate,
		handler: deleteCollaboratorController,
	});
}
