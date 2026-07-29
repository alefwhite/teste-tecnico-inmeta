import "dotenv/config";

import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
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
import { env } from "./shared/config/env";

export const app = Fastify({
	logger: true,
});

app.register(fastifyCors, {
	origin: ["http://localhost:3000"],
	credentials: true,
});

app.register(fastifyHelmet);

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
