import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "@/app";
import { prisma } from "@/infrastructure/database/prisma";
import { resetDatabase } from "./helpers/reset-database";
import {
	createAndLogin,
	createCollaborator,
	defaultCollaborator,
} from "./helpers/test-utils";

describe("Collaborators API (integration)", () => {
	beforeAll(async () => {
		await app.ready();
	});

	beforeEach(async () => {
		await resetDatabase();
	});

	describe("POST /collaborators", () => {
		it("creates a collaborator without exposing the password", async () => {
			const { response, body } = await createCollaborator(app);

			expect(response.statusCode).toBe(201);
			expect(body.id).toBeTruthy();
			expect(body.name).toBe("Ana Souza");
			expect(body.email).toBe("ana@example.com");

			const stored = await prisma.collaborators.findUnique({
				where: { id: body.id },
			});

			expect(stored?.password).not.toBe("secret123");
			expect(stored?.password).toMatch(/^\$2/);
		});

		it("returns 409 when the email is already in use", async () => {
			await createCollaborator(app);

			const { response } = await createCollaborator(app, { name: "Outra Ana" });

			expect(response.statusCode).toBe(409);
			expect(response.json()).toMatchObject({
				message: "Collaborator with this email already exists.",
			});
		});

		it("returns 400 for an invalid email", async () => {
			const { response } = await createCollaborator(app, {
				email: "not-an-email",
			});

			expect(response.statusCode).toBe(400);
			expect(response.json().errors).toHaveProperty("email");
		});
	});

	describe("protected routes", () => {
		it("returns 401 without a token", async () => {
			const response = await app.inject({
				method: "GET",
				url: "/collaborators",
			});

			expect(response.statusCode).toBe(401);
		});

		it("lists, gets, updates and soft-deletes a collaborator", async () => {
			const { headers } = await createAndLogin(app);
			const { body: created } = await createCollaborator(app, {
				name: "Bia Lima",
				email: "bia@example.com",
			});

			const list = await app.inject({
				method: "GET",
				url: "/collaborators?search=bia",
				headers,
			});

			expect(list.statusCode).toBe(200);
			expect(list.json().data).toHaveLength(1);

			const get = await app.inject({
				method: "GET",
				url: `/collaborators/${created.id}`,
				headers,
			});

			expect(get.statusCode).toBe(200);
			expect(get.json().name).toBe("Bia Lima");

			const patch = await app.inject({
				method: "PATCH",
				url: `/collaborators/${created.id}`,
				headers,
				payload: { name: "Bia Oliveira" },
			});

			expect(patch.statusCode).toBe(200);
			expect(patch.json().name).toBe("Bia Oliveira");

			const del = await app.inject({
				method: "DELETE",
				url: `/collaborators/${created.id}`,
				headers,
			});

			expect(del.statusCode).toBe(204);

			const deletedGet = await app.inject({
				method: "GET",
				url: `/collaborators/${created.id}`,
				headers,
			});

			expect(deletedGet.statusCode).toBe(404);
		});

		it("returns 409 when updating to an existing email", async () => {
			const { headers } = await createAndLogin(app);
			const { body: created } = await createCollaborator(app, {
				name: "Bia Lima",
				email: "bia@example.com",
			});

			const patch = await app.inject({
				method: "PATCH",
				url: `/collaborators/${created.id}`,
				headers,
				payload: { email: defaultCollaborator.email },
			});

			expect(patch.statusCode).toBe(409);
		});
	});
});
