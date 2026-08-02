import type { FastifyReply, FastifyRequest } from "fastify";
import { makeLoginUseCase } from "@/application/factories/make-auth-use-cases";
import type { LoginUseCaseInput } from "@/application/use-cases/auth/login.use-case";
import { AuthResource } from "@/presentation/http/resource/auth";
import { env } from "@/shared/config/env";

export async function loginController(
	request: FastifyRequest<{ Body: LoginUseCaseInput }>,
	reply: FastifyReply,
) {
	const { email, password } = request.body;

	const useCase = makeLoginUseCase(request.server);

	const result = await useCase.execute({ email, password });

	return reply
		.setCookie("refreshToken", result.refreshToken, {
			path: "/",
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			sameSite: env.NODE_ENV === "production" ? "none" : "lax",
		})
		.status(200)
		.send(AuthResource.make(result));
}
