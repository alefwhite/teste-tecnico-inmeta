import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createCollaboratorController } from "@/presentation/http/controllers/collaborators/create-collaborator.controller";
import {
	createCollaboratorBodySchema,
	createCollaboratorResponseSchema,
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
}
