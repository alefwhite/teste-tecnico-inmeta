import type { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "@/domain/errors/unauthorized-error";

export async function authenticate(
	request: FastifyRequest,
	_reply: FastifyReply,
) {
	try {
		await request.jwtVerify();
	} catch {
		throw new UnauthorizedError("Invalid or expired token");
	}
}
