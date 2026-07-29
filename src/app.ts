import "dotenv/config";

import path from "node:path";
import cookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyJwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";

import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";
import { env } from "@/shared/config/env";

export const app = Fastify({
	logger: true,
});

app.register(fastifyCors, {
	origin: ["http://localhost:3000"],
	credentials: true,
});

app.register(fastifyHelmet);
app.register(fastifyRateLimit, {
	max: 200,
	timeWindow: "1 minute",
});

app.register(multipart, {
	limits: { fileSize: 16777216 },
});
app.register(fastifyStatic, {
	root: path.resolve("./uploads"),
	prefix: "/uploads",
});

app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
	cookie: {
		cookieName: "refreshToken",
		signed: false,
	},
	sign: {
		// expiresIn: '15m', TODO: Depois que fizer o refresh token mudar para 15m
		expiresIn: "30d",
	},
});

app.register(cookie);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: "API de Gerenciamento de documentação de colaboradores",
			description: "Gerenciamento de documentação de colaboradores",
			version: "1.0.0",
		},
		servers: [
			{
				description: "Localhost",
				url: `http://localhost:${env.PORT}`,
			},
		],
	},
	transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
	routePrefix: "/docs",
	uiConfig: {
		docExpansion: "list",
		deepLinking: true,
	},
});

app.withTypeProvider<ZodTypeProvider>().route({
	method: "GET",
	url: "/",
	schema: {
		description: "Health Check",
		tags: ["Health"],
		response: {
			200: z.object({
				message: z.string(),
			}),
		},
	},
	handler: () => {
		return {
			message: "Server is up and running",
		};
	},
});
