import type {
	TokenPayload,
	TokenProvider,
} from "@/domain/providers/token.provider";

export class FakeTokenProvider implements TokenProvider {
	signAccessToken(payload: TokenPayload): string {
		return `access:${payload.sub}`;
	}

	signRefreshToken(payload: TokenPayload): string {
		return `refresh:${payload.sub}`;
	}

	verifyAccessToken(token: string): TokenPayload {
		return { sub: token.replace("access:", "") };
	}
}
