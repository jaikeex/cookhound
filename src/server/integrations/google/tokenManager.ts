import { createSign } from 'crypto';
import type { ServiceAccount, AccessToken } from './types';
import { Logger } from '@/server/logger';
import { ServerError } from '@/server/error';

const log = Logger.getInstance('google-token-manager');

const GOOGLE_TOKEN_URI = 'https://oauth2.googleapis.com/token';

interface TokenManagerOptions {
    jwtExpiryMinutes?: number;
    tokenBufferSeconds?: number;
    maxRetries?: number;
}

/**
 * Manages access tokens for a Google service account.
 * It handles fetching new tokens and caching them until they expire.
 */
export class TokenManager {
    private accessToken: string | null = null;
    private tokenExpiry: Date | null = null;

    /**
     * @param serviceAccount - The service account credentials.
     * @param scopes - The scopes to request for the access token.
     * @param options - Optional configuration options for the token manager.
     */
    constructor(
        private readonly serviceAccount: ServiceAccount,
        private readonly scopes: string[],
        private readonly options: TokenManagerOptions = {}
    ) {}

    /**
     * Gets an access token, fetching a new one if necessary.
     *
     * @returns A promise that resolves to the access token.
     */
    public async getAccessToken(): Promise<string> {
        if (
            this.accessToken &&
            this.tokenExpiry &&
            this.tokenExpiry > new Date()
        ) {
            return this.accessToken;
        }

        const newAccessToken = await this.fetchNewAccessToken();
        this.accessToken = newAccessToken.access_token;
        //-300 seconds to account for clock drift and latency
        this.tokenExpiry = new Date(
            new Date().getTime() + (newAccessToken.expires_in - 300) * 1000
        );

        return this.accessToken;
    }

    /**
     * Creates a new JWT for authenticating with the Google OAuth2 API.
     * @returns The created JWT.
     * @internal
     */
    private createJwt(): string {
        const header = {
            alg: 'RS256',
            typ: 'JWT'
        };

        const now = Math.floor(Date.now() / 1000);
        const thirtyMinutes = 60 * 30;

        const claims = {
            iss: this.serviceAccount.client_email,
            scope: this.scopes.join(' '),
            aud: GOOGLE_TOKEN_URI,
            exp: now + thirtyMinutes,
            iat: now
        };

        const base64Header = Buffer.from(JSON.stringify(header)).toString(
            'base64url'
        );
        const base64Claims = Buffer.from(JSON.stringify(claims)).toString(
            'base64url'
        );

        const signatureInput = `${base64Header}.${base64Claims}`;

        const sign = createSign('RSA-SHA256');
        sign.update(signatureInput);
        const signature = sign.sign(
            this.serviceAccount.private_key,
            'base64url'
        );

        return `${signatureInput}.${signature}`;
    }

    /**
     * Fetches a new access token from the Google OAuth2 API.
     * @returns A promise that resolves to the new access token.
     * @internal
     */
    private async fetchNewAccessToken(): Promise<AccessToken> {
        const maxRetries = this.options.maxRetries || 3;
        const backoffMs = 1000;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const jwt = this.createJwt();
                const response = await this.makeTokenRequest(jwt);
                return (await response.json()) as AccessToken;
            } catch (error: any) {
                if (attempt === maxRetries) {
                    log.error(
                        'fetchNewAccessToken - failed to fetch google api access token',
                        {
                            error,
                            stack: error.stack
                        }
                    );
                    throw new ServerError('app.error.default', 500);
                }

                await new Promise((resolve) =>
                    setTimeout(resolve, backoffMs * attempt)
                );
            }
        }

        /**
         * Realistically, the code should never reach this point.
         */
        log.error(
            'fetchNewAccessToken - failed to fetch google api access token'
        );

        throw new ServerError('app.error.default', 500);
    }

    private async makeTokenRequest(jwt: string): Promise<Response> {
        const response = await fetch(GOOGLE_TOKEN_URI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwt
            })
        });

        if (!response.ok) {
            const errorText = await response.text();

            log.error(
                'makeTokenRequest - failed to fetch google api access token',
                {
                    errorText
                }
            );

            throw new ServerError('app.error.default', 500);
        }

        return response;
    }
}
