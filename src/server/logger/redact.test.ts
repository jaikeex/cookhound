import { describe, it, expect } from 'vitest';
import {
    REDACTED,
    redactSensitiveReplacer,
    safeStringify,
    isSensitiveKey
} from './redact';

/**
 * These tests pin the logger's redaction contract: secrets that reach the
 * logger as object fields (single-use tokens, OAuth codes, passwords) must
 * never be serialised in the clear, while ordinary context (email, username,
 * ids) must survive. All object logging in the app funnels through
 * `safeStringify`, so covering it here covers every call site — including the
 * `@LogServiceMethod({ names: [...] })` payloads and ad-hoc
 * `log.*('msg', { token })` calls.
 */

describe('redactSensitiveReplacer', () => {
    it('masks the value of a sensitive key', () => {
        expect(redactSensitiveReplacer('token', 'abc123')).toBe(REDACTED);
        expect(redactSensitiveReplacer('password', 'hunter2')).toBe(REDACTED);
        expect(redactSensitiveReplacer('code', 'oauth-code')).toBe(REDACTED);
    });

    it('matches sensitive keys case-insensitively', () => {
        expect(redactSensitiveReplacer('Token', 'x')).toBe(REDACTED);
        expect(redactSensitiveReplacer('ACCESSTOKEN', 'x')).toBe(REDACTED);
        expect(redactSensitiveReplacer('passwordHash', 'x')).toBe(REDACTED);
    });

    it('passes through non-sensitive keys unchanged', () => {
        expect(redactSensitiveReplacer('email', 'a@b.com')).toBe('a@b.com');
        expect(redactSensitiveReplacer('username', 'jakub')).toBe('jakub');
        expect(redactSensitiveReplacer('userId', 42)).toBe(42);
    });

    it('does not mask keys whose sensitive word is not the trailing segment', () => {
        // Trailing-segment rule: a root that leads the key (with a descriptive
        // suffix) is metadata, not the secret itself, so it stays readable.
        expect(isSensitiveKey('tokenExpiresAt')).toBe(false);
        expect(isSensitiveKey('codeName')).toBe(false);
        expect(isSensitiveKey('encodePayload')).toBe(false);
        // Overloaded roots (code/key) collide with fields used all over the
        // repo; they must only match exactly, never as a suffix.
        expect(isSensitiveKey('statusCode')).toBe(false);
        expect(isSensitiveKey('errorCode')).toBe(false);
        expect(isSensitiveKey('cacheKey')).toBe(false);
    });

    it('masks compound and snake_case secret keys (the future-proofing set)', () => {
        for (const key of [
            'resetToken',
            'verificationToken',
            'access_token',
            'id_token',
            'refreshToken',
            'clientSecret',
            'apiSecret',
            'userCredentials',
            'apiKey',
            'passwordHash'
        ]) {
            expect(isSensitiveKey(key)).toBe(true);
        }
    });
});

describe('safeStringify', () => {
    it('redacts a top-level token (the verifyEmail / mail-service shape)', () => {
        // Mirrors the payload built by @LogServiceMethod({ names: ['token'] })
        // and the in-body log.warn('...', { token }) calls.
        const out = safeStringify({ token: 'secret-token', email: 'a@b.com' });

        expect(out).not.toContain('secret-token');
        expect(out).toContain(REDACTED);
        expect(out).toContain('a@b.com');
    });

    it('redacts a nested OAuth code (the loginWithGoogle payload shape)', () => {
        const out = safeStringify({ payload: { code: 'oauth-secret' } });

        expect(out).not.toContain('oauth-secret');
        expect(out).toContain(REDACTED);
    });

    it('redacts passwords in nested and array structures', () => {
        const out = safeStringify({
            users: [
                { username: 'a', password: 'p1' },
                { username: 'b', newPassword: 'p2' }
            ]
        });

        expect(out).not.toContain('p1');
        expect(out).not.toContain('p2');
        expect(out).toContain('a');
        expect(out).toContain('b');
    });

    it('preserves non-sensitive context in full', () => {
        const out = safeStringify({
            userId: 7,
            email: 'a@b.com',
            username: 'jakub'
        });

        expect(out).toBe('{"userId":7,"email":"a@b.com","username":"jakub"}');
    });

    it('returns plain strings untouched for readability', () => {
        // Documented caveat: a bare string message is not redacted. Secrets
        // are always logged as object fields, never as the primary message.
        expect(safeStringify('a multiline\nmessage')).toBe(
            'a multiline\nmessage'
        );
    });

    it('does not crash on circular structures', () => {
        const circular: Record<string, unknown> = { name: 'x' };
        circular.self = circular;

        // JSON.stringify throws on the cycle; we fall back to String(value)
        // rather than letting the log path throw.
        expect(() => safeStringify(circular)).not.toThrow();
        expect(safeStringify(circular)).toBe('[object Object]');
    });
});
