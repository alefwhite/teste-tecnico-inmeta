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
	let documentTypeId: string | undefined;
	let fileName: string | undefined;
	let mimeType: string | undefined;
	let buffer: Buffer | undefined;

	for await (const part of request.parts()) {
		if (part.type === "field" && part.fieldname === "documentTypeId") {
			documentTypeId = String(part.value);
		} else if (part.type === "file") {
			const partBuffer = await part.toBuffer();
			if (!buffer) {
				fileName = part.filename;
				mimeType = part.mimetype;
				buffer = partBuffer;
			}
		}
	}

	if (!buffer) {
		throw new BadRequestError("A file is required.");
	}

	const parsedDocumentTypeId = documentTypeIdSchema.safeParse(documentTypeId);

	if (!parsedDocumentTypeId.success) {
		throw new BadRequestError("A valid documentTypeId is required.");
	}

	const useCase = makeSubmitDocumentUseCase();

	const result = await useCase.execute({
		collaboratorId: request.user.sub,
		documentTypeId: parsedDocumentTypeId.data,
		fileName: fileName ?? "",
		fileSize: buffer.byteLength,
		mimeType: mimeType ?? "",
		buffer,
	});

	return reply.status(201).send(DocumentResource.make(result));
}
