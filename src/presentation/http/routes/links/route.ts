import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { linkCollaboratorToDocumentTypeController } from "@/presentation/http/controllers/links/link-collaborator-to-document-type.controller";
import { unlinkCollaboratorFromDocumentTypeController } from "@/presentation/http/controllers/links/unlink-collaborator-from-document-type.controller";
import { authenticate } from "@/presentation/http/middlewares/authenticate";
import {
	linkCollaboratorParamsSchema,
	linkDocumentTypeBodySchema,
	linkParamsSchema,
	linkResourceSchema,
} from "@/presentation/http/routes/links/link.schema";

export async function linksRoutes(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().route({
		method: "POST",
		url: "/:collaboratorId/document-types",
		schema: {
			description: "Link a collaborator to a document type",
			tags: ["Links"],
			params: linkCollaboratorParamsSchema,
			body: linkDocumentTypeBodySchema,
			response: { 201: linkResourceSchema },
		},
		preHandler: authenticate,
		handler: linkCollaboratorToDocumentTypeController,
	});

	app.withTypeProvider<ZodTypeProvider>().route({
		method: "DELETE",
		url: "/:collaboratorId/document-types/:documentTypeId",
		schema: {
			description: "Unlink a collaborator from a document type",
			tags: ["Links"],
			params: linkParamsSchema,
		},
		preHandler: authenticate,
		handler: unlinkCollaboratorFromDocumentTypeController,
	});
}
