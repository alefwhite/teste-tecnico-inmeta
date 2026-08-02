import type { FastifyReply, FastifyRequest } from "fastify";

export async function logoutController(
	_request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.clearCookie("refreshToken", { path: "/" });

	return reply.status(204).send();
}
