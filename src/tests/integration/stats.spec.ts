import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "@/app";
import { resetDatabase } from "./helpers/reset-database";
import {
	createAndLogin,
	createDocumentType,
	linkCollaboratorToDocumentType,
	submitDocument,
} from "./helpers/test-utils";

describe("Stats API (integration)", () => {
	beforeAll(async () => {
		await app.ready();
	});

	beforeEach(async () => {
		await resetDatabase();
	});

	it("returns zeroed stats when there is no data", async () => {
		const { headers } = await createAndLogin(app);

		const response = await app.inject({
			method: "GET",
			url: "/stats/dashboard",
			headers,
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			completionRate: null,
			totalLinks: 0,
			completedLinks: 0,
			topPendingDocumentTypes: [],
			recentSubmissions: [],
		});
	});

	it("computes completion rate, top pending types and recent submissions", async () => {
		const { headers, collaboratorId } = await createAndLogin(app);

		const rg = await createDocumentType(app, headers, "RG");
		const cpf = await createDocumentType(app, headers, "CPF");

		await linkCollaboratorToDocumentType(
			app,
			headers,
			collaboratorId,
			rg.body.id,
		);
		await linkCollaboratorToDocumentType(
			app,
			headers,
			collaboratorId,
			cpf.body.id,
		);

		await submitDocument(app, headers, {
			documentTypeId: rg.body.id,
			fileName: "rg.pdf",
			fileSize: 1024,
			mimeType: "application/pdf",
		});

		const response = await app.inject({
			method: "GET",
			url: "/stats/dashboard",
			headers,
		});

		expect(response.statusCode).toBe(200);

		const stats = response.json();

		expect(stats.totalLinks).toBe(2);
		expect(stats.completedLinks).toBe(1);
		expect(stats.completionRate).toBe(50);

		expect(stats.topPendingDocumentTypes).toContainEqual(
			expect.objectContaining({ name: "CPF", pendingCount: 1 }),
		);

		expect(stats.recentSubmissions[0]).toMatchObject({
			documentType: { name: "RG" },
			collaborator: { name: "Ana Souza" },
		});
		expect(stats.recentSubmissions[0].version.versionNumber).toBe(1);
	});
});
