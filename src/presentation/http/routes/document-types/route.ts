import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createDocumentTypeController } from "@/presentation/http/controllers/document-types/create-document-type.controller";
import { deleteDocumentTypeController } from "@/presentation/http/controllers/document-types/delete-document-type.controller";
import { listDocumentTypesController } from "@/presentation/http/controllers/document-types/list-document-types.controller";
import { updateDocumentTypeController } from "@/presentation/http/controllers/document-types/update-document-type.controller";
import { authenticate } from "@/presentation/http/middlewares/authenticate";
import {
	createDocumentTypeBodySchema,
	documentTypeIdParamsSchema,
	documentTypeResourceSchema,
	listDocumentTypesResponseSchema,
	updateDocumentTypeBodySchema,
} from "@/presentation/http/routes/document-types/document-type.schema";

export async function documentTypesRoutes(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().route({
		method: "POST",
		url: "/",
		schema: {
			description: "Create a new document type",
			tags: ["Document Types"],
			body: createDocumentTypeBodySchema,
			response: { 201: documentTypeResourceSchema },
		},
		preHandler: authenticate,
		handler: createDocumentTypeController,
	});

	app.withTypeProvider<ZodTypeProvider>().route({
		method: "GET",
		url: "/",
		schema: {
			description: "List document types",
			tags: ["Document Types"],
			response: { 200: listDocumentTypesResponseSchema },
		},
		preHandler: authenticate,
		handler: listDocumentTypesController,
	});

	app.withTypeProvider<ZodTypeProvider>().route({
		method: "PATCH",
		url: "/:id",
		schema: {
			description: "Update a document type",
			tags: ["Document Types"],
			params: documentTypeIdParamsSchema,
			body: updateDocumentTypeBodySchema,
			response: { 200: documentTypeResourceSchema },
		},
		preHandler: authenticate,
		handler: updateDocumentTypeController,
	});

	app.withTypeProvider<ZodTypeProvider>().route({
		method: "DELETE",
		url: "/:id",
		schema: {
			description: "Soft delete a document type",
			tags: ["Document Types"],
			params: documentTypeIdParamsSchema,
		},
		preHandler: authenticate,
		handler: deleteDocumentTypeController,
	});
}
