import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeSubmitDocumentUseCase } from "@/application/factories/make-document-use-cases";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { DocumentResource } from "@/presentation/http/resource/document";

const documentTypeIdSchema = z.uuid();

export async function submitDocumentController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const part = await request.file();

	if (!part) {
		throw new BadRequestError("A file is required.");
	}

	const documentTypeIdField = part.fields.documentTypeId;
	const rawDocumentTypeId = Array.isArray(documentTypeIdField)
		? documentTypeIdField[0]
		: documentTypeIdField;
	const documentTypeIdValue =
		rawDocumentTypeId && "value" in rawDocumentTypeId
			? rawDocumentTypeId.value
			: undefined;

	const documentTypeId = documentTypeIdSchema.safeParse(documentTypeIdValue);

	if (!documentTypeId.success) {
		throw new BadRequestError("A valid documentTypeId is required.");
	}

	const buffer = await part.toBuffer();

	const useCase = makeSubmitDocumentUseCase();

	const result = await useCase.execute({
		collaboratorId: request.user.sub,
		documentTypeId: documentTypeId.data,
		fileName: part.filename,
		fileSize: buffer.byteLength,
		mimeType: part.mimetype,
		buffer,
	});

	return reply.status(201).send(DocumentResource.make(result));
}
