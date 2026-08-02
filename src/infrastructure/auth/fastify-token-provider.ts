import type { JWT } from "@fastify/jwt";
import type {
	TokenPayload,
	TokenProvider,
} from "@/domain/providers/token.provider";

export class FastifyTokenProvider implements TokenProvider {
	constructor(private jwt: JWT) {}

	signAccessToken(payload: TokenPayload): string {
		return this.jwt.sign(payload, { expiresIn: "15m" });
	}

	signRefreshToken(payload: TokenPayload): string {
		return this.jwt.sign(payload, { expiresIn: "30d" });
	}

	verifyAccessToken(token: string): TokenPayload {
		return this.jwt.verify<TokenPayload>(token);
	}
}
