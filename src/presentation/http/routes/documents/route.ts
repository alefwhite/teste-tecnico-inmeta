import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteDocumentController } from "@/presentation/http/controllers/documents/delete-document.controller";
import { getDocumentHistoryController } from "@/presentation/http/controllers/documents/get-document-history.controller";
import { listPendingDocumentsController } from "@/presentation/http/controllers/documents/list-pending-documents.controller";
import { submitDocumentController } from "@/presentation/http/controllers/documents/submit-document.controller";
import { authenticate } from "@/presentation/http/middlewares/authenticate";
import {
	documentHistoryResponseSchema,
	documentIdParamsSchema,
	listPendingDocumentsQuerySchema,
	listPendingDocumentsResponseSchema,
	submitDocumentResponseSchema,
} from "@/presentation/http/routes/documents/document.schema";

export async function documentsRoutes(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().route({
		method: "POST",
		url: "/",
		schema: {
			description: "Submit a document file (creates a new version)",
			tags: ["Documents"],
			consumes: ["multipart/form-data"],
			response: { 201: submitDocumentResponseSchema },
		},
		preHandler: authenticate,
		handler: submitDocumentController,
	});

	app.withTypeProvider<ZodTypeProvider>().route({
		method: "GET",
		url: "/pending",
		schema: {
			description: "List pending documents with pagination and filters",
			tags: ["Documents"],
			querystring: listPendingDocumentsQuerySchema,
			response: { 200: listPendingDocumentsResponseSchema },
		},
		preHandler: authenticate,
		handler: listPendingDocumentsController,
	});

	app.withTypeProvider<ZodTypeProvider>().route({
		method: "GET",
		url: "/:id/versions",
		schema: {
			description: "Get the version history of a document",
			tags: ["Documents"],
			params: documentIdParamsSchema,
			response: { 200: documentHistoryResponseSchema },
		},
		preHandler: authenticate,
		handler: getDocumentHistoryController,
	});

	app.withTypeProvider<ZodTypeProvider>().route({
		method: "DELETE",
		url: "/:id",
		schema: {
			description: "Soft delete a document",
			tags: ["Documents"],
			params: documentIdParamsSchema,
		},
		preHandler: authenticate,
		handler: deleteDocumentController,
	});
}
