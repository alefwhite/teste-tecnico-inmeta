import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "@/app";
import { prisma } from "@/infrastructure/database/prisma";
import { resetDatabase } from "./helpers/reset-database";
import {
	createAndLogin,
	createDocumentType,
	linkCollaboratorToDocumentType,
	submitDocument,
} from "./helpers/test-utils";

describe("Documents API (integration)", () => {
	let headers: Record<string, string>;
	let collaboratorId: string;
	let documentTypeId: string;

	beforeAll(async () => {
		await app.ready();
	});

	beforeEach(async () => {
		await resetDatabase();

		const loginResult = await createAndLogin(app);
		headers = loginResult.headers;
		collaboratorId = loginResult.collaboratorId;

		const documentType = await createDocumentType(app, headers);
		documentTypeId = documentType.body.id;

		await linkCollaboratorToDocumentType(
			app,
			headers,
			collaboratorId,
			documentTypeId,
		);
	});

	it("submits a document and increments versions", async () => {
		const first = await submitDocument(app, headers, {
			documentTypeId,
			fileName: "rg.pdf",
			fileSize: 1024,
			mimeType: "application/pdf",
		});

		expect(first.response.statusCode).toBe(201);
		expect(first.body.version.versionNumber).toBe(1);

		const second = await submitDocument(app, headers, {
			documentTypeId,
			fileName: "rg-v2.pdf",
			fileSize: 2048,
			mimeType: "application/pdf",
		});

		expect(second.response.statusCode).toBe(201);
		expect(second.body.version.versionNumber).toBe(2);
		expect(second.body.document.id).toBe(first.body.document.id);
	});

	it("returns the full version history", async () => {
		for (let index = 1; index <= 3; index++) {
			await submitDocument(app, headers, {
				documentTypeId,
				fileName: `rg-v${index}.pdf`,
				fileSize: 1024 * index,
				mimeType: "application/pdf",
			});
		}

		const history = await app.inject({
			method: "GET",
			url: `/documents/${(await prisma.documents.findFirst({ where: { collaboratorId } }))?.id}/versions`,
			headers,
		});

		expect(history.statusCode).toBe(200);
		expect(
			history
				.json()
				.versions.map(
					(version: { versionNumber: number }) => version.versionNumber,
				),
		).toEqual([1, 2, 3]);
	});

	it("returns 404 for the history of an unknown document", async () => {
		const history = await app.inject({
			method: "GET",
			url: "/documents/00000000-0000-0000-0000-000000000000/versions",
			headers,
		});

		expect(history.statusCode).toBe(404);
	});

	it("lists pending documents and removes them after submission", async () => {
		const pendingBefore = await app.inject({
			method: "GET",
			url: "/documents/pending",
			headers,
		});

		expect(pendingBefore.statusCode).toBe(200);
		expect(pendingBefore.json().data).toHaveLength(1);
		expect(pendingBefore.json().data[0]).toMatchObject({
			collaborator: { id: collaboratorId },
			documentType: { id: documentTypeId },
		});

		await submitDocument(app, headers, {
			documentTypeId,
			fileName: "rg.pdf",
			fileSize: 1024,
			mimeType: "application/pdf",
		});

		const pendingAfter = await app.inject({
			method: "GET",
			url: "/documents/pending",
			headers,
		});

		expect(pendingAfter.json().data).toHaveLength(0);
	});

	it("becomes pending again after the document is soft-deleted and restores on resubmission", async () => {
		const submitted = await submitDocument(app, headers, {
			documentTypeId,
			fileName: "rg.pdf",
			fileSize: 1024,
			mimeType: "application/pdf",
		});

		const del = await app.inject({
			method: "DELETE",
			url: `/documents/${submitted.body.document.id}`,
			headers,
		});

		expect(del.statusCode).toBe(204);

		const pending = await app.inject({
			method: "GET",
			url: "/documents/pending",
			headers,
		});

		expect(pending.json().data).toHaveLength(1);

		const resubmitted = await submitDocument(app, headers, {
			documentTypeId,
			fileName: "rg-restored.pdf",
			fileSize: 4096,
			mimeType: "application/pdf",
		});

		expect(resubmitted.body.version.versionNumber).toBe(2);
		expect(resubmitted.body.document.id).toBe(submitted.body.document.id);
	});

	it("returns 400 when the collaborator is not linked to the document type", async () => {
		const otherType = await createDocumentType(app, headers, "CPF");

		const result = await submitDocument(app, headers, {
			documentTypeId: otherType.body.id,
			fileName: "cpf.pdf",
			fileSize: 1024,
			mimeType: "application/pdf",
		});

		expect(result.response.statusCode).toBe(400);
	});
});
