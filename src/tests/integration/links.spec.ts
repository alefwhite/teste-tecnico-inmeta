import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "@/app";
import { prisma } from "@/infrastructure/database/prisma";
import { resetDatabase } from "./helpers/reset-database";
import {
	createAndLogin,
	createCollaborator,
	createDocumentType,
	linkCollaboratorToDocumentType,
} from "./helpers/test-utils";

describe("Links API (integration)", () => {
	beforeAll(async () => {
		await app.ready();
	});

	beforeEach(async () => {
		await resetDatabase();
	});

	it("links and unlinks a collaborator to a document type", async () => {
		const { headers } = await createAndLogin(app);
		const { body: collaborator } = await createCollaborator(app, {
			name: "Bia Lima",
			email: "bia@example.com",
		});
		const { body: documentType } = await createDocumentType(app, headers);

		const link = await linkCollaboratorToDocumentType(
			app,
			headers,
			collaborator.id,
			documentType.id,
		);

		expect(link.statusCode).toBe(201);
		expect(link.json()).toMatchObject({
			collaboratorId: collaborator.id,
			documentTypeId: documentType.id,
		});

		const stored = await prisma.collaboratorDocumentTypes.findFirst({
			where: {
				collaboratorId: collaborator.id,
				documentTypeId: documentType.id,
			},
		});

		expect(stored).not.toBeNull();

		const unlink = await app.inject({
			method: "DELETE",
			url: `/collaborators/${collaborator.id}/document-types/${documentType.id}`,
			headers,
		});

		expect(unlink.statusCode).toBe(204);

		const afterUnlink = await prisma.collaboratorDocumentTypes.findFirst({
			where: {
				collaboratorId: collaborator.id,
				documentTypeId: documentType.id,
			},
		});

		expect(afterUnlink).toBeNull();
	});

	it("returns 409 when linking the same pair twice", async () => {
		const { headers } = await createAndLogin(app);
		const { body: collaborator } = await createCollaborator(app, {
			name: "Bia Lima",
			email: "bia@example.com",
		});
		const { body: documentType } = await createDocumentType(app, headers);

		await linkCollaboratorToDocumentType(
			app,
			headers,
			collaborator.id,
			documentType.id,
		);

		const duplicate = await linkCollaboratorToDocumentType(
			app,
			headers,
			collaborator.id,
			documentType.id,
		);

		expect(duplicate.statusCode).toBe(409);
	});

	it("returns 404 for unknown collaborator or document type", async () => {
		const { headers } = await createAndLogin(app);
		const { body: documentType } = await createDocumentType(app, headers);

		const missingCollaborator = await linkCollaboratorToDocumentType(
			app,
			headers,
			"00000000-0000-0000-0000-000000000000",
			documentType.id,
		);

		expect(missingCollaborator.statusCode).toBe(404);

		const missingType = await linkCollaboratorToDocumentType(
			app,
			headers,
			(
				await createCollaborator(app, {
					name: "Bia Lima",
					email: "bia@example.com",
				})
			).body.id,
			"00000000-0000-0000-0000-000000000000",
		);

		expect(missingType.statusCode).toBe(404);
	});

	it("returns 404 when unlinking a pair that was never linked", async () => {
		const { headers } = await createAndLogin(app);

		const unlink = await app.inject({
			method: "DELETE",
			url: "/collaborators/00000000-0000-0000-0000-000000000000/document-types/00000000-0000-0000-0000-000000000000",
			headers,
		});

		expect(unlink.statusCode).toBe(404);
	});
});
