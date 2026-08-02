import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { loginController } from "@/presentation/http/controllers/auth/login.controller";
import { logoutController } from "@/presentation/http/controllers/auth/logout.controller";
import {
	loginBodySchema,
	loginResponseSchema,
} from "@/presentation/http/routes/auth/auth.schema";

export async function authRoutes(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().route({
		method: "POST",
		url: "/login",
		schema: {
			description: "Authenticate a collaborator",
			tags: ["Auth"],
			body: loginBodySchema,
			response: { 200: loginResponseSchema },
		},
		handler: loginController,
	});

	app.withTypeProvider<ZodTypeProvider>().route({
		method: "POST",
		url: "/logout",
		schema: {
			description: "Logout and clear the refresh token cookie",
			tags: ["Auth"],
		},
		handler: logoutController,
	});
}
