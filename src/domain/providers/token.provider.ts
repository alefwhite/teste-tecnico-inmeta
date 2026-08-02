export interface TokenPayload {
	sub: string;
}

export interface TokenProvider {
	signAccessToken(payload: TokenPayload): string;
	signRefreshToken(payload: TokenPayload): string;
	verifyAccessToken(token: string): TokenPayload;
}
