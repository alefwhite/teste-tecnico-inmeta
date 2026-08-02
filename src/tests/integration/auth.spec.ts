import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "@/app";
import { resetDatabase } from "./helpers/reset-database";
import {
	createCollaborator,
	defaultCollaborator,
	login,
} from "./helpers/test-utils";

function toCookieArray(value: string | string[] | undefined): string[] {
	if (Array.isArray(value)) return value;
	return value ? [value] : [];
}

describe("Auth API (integration)", () => {
	beforeAll(async () => {
		await app.ready();
	});

	beforeEach(async () => {
		await resetDatabase();
	});

	describe("POST /auth/login", () => {
		it("returns an access token and sets the refresh token cookie", async () => {
			await createCollaborator(app);

			const { response, body } = await login(
				app,
				defaultCollaborator.email,
				defaultCollaborator.password,
			);

			expect(response.statusCode).toBe(200);
			expect(body.accessToken).toBeTruthy();

			const setCookie = response.headers["set-cookie"];
			const cookies = toCookieArray(setCookie);

			expect(cookies.some((cookie) => cookie.startsWith("refreshToken="))).toBe(
				true,
			);
		});

		it("returns 401 for an unknown email", async () => {
			const { response } = await login(app, "missing@example.com", "secret123");

			expect(response.statusCode).toBe(401);
			expect(response.json()).toMatchObject({ message: "Invalid credentials" });
		});

		it("returns 401 for a wrong password", async () => {
			await createCollaborator(app);

			const { response } = await login(app, defaultCollaborator.email, "wrong");

			expect(response.statusCode).toBe(401);
		});
	});

	describe("POST /auth/logout", () => {
		it("clears the refresh token cookie", async () => {
			await createCollaborator(app);

			const loginResponse = await login(
				app,
				defaultCollaborator.email,
				defaultCollaborator.password,
			);

			const refreshToken =
				toCookieArray(loginResponse.response.headers["set-cookie"])
					.find((cookie) => cookie.startsWith("refreshToken="))
					?.split("=")[1]
					.split(";")[0] ?? "";

			const response = await app.inject({
				method: "POST",
				url: "/auth/logout",
				cookies: { refreshToken },
			});

			expect(response.statusCode).toBe(204);

			const clearedSetCookie = response.headers["set-cookie"];
			const clearedCookie = toCookieArray(clearedSetCookie);

			expect(
				clearedCookie.some(
					(cookie) =>
						cookie.startsWith("refreshToken=") && cookie.includes("Max-Age=0"),
				),
			).toBe(true);
		});
	});
});
