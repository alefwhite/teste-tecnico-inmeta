import type { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "@/domain/errors/unauthorized-error";

export async function authenticate(
	request: FastifyRequest,
	_reply: FastifyReply,
) {
	const authHeader = request.headers.authorization;

	if (!authHeader) {
		throw new UnauthorizedError("Token não informado.");
	}

	try {
		await request.jwtVerify();
	} catch {
		throw new UnauthorizedError("Token inválido.");
	}
}
