import { describe, it, expect, vi } from 'vitest';
import {
    extractPreferredLanguage,
    isSupportedLocale,
    getUserLocale
} from './functions';
import { DEFAULT_LOCALE } from '@/client/constants';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

describe('Localization utilities', () => {
    describe('extractPreferredLanguage', () => {
        it('returns default locale when header is null', () => {
            expect(extractPreferredLanguage(null)).toBe(DEFAULT_LOCALE);
        });

        it('returns highest quality language', () => {
            const headerValue = 'fr;q=0.8,en-US;q=0.9,en;q=0.7';
            expect(extractPreferredLanguage(headerValue)).toBe('en');
        });

        it('returns default locale when no languages are parsed', () => {
            expect(extractPreferredLanguage('')).toBe(DEFAULT_LOCALE);
        });
    });

    describe('isSupportedLocale', () => {
        it('returns true for supported locale', () => {
            expect(isSupportedLocale('en')).toBe(true);
        });

        it('returns false for unsupported locale', () => {
            expect(isSupportedLocale('xy')).toBe(false);
        });
    });

    describe('getUserLocale', () => {
        it('uses locale from cookies if available', async () => {
            const cookies = {
                get: vi.fn().mockReturnValue({ value: 'en' })
            } as unknown as ReadonlyRequestCookies;
            const headers = new Headers();
            const result = await getUserLocale(cookies, headers);
            expect(result).toBe('en');
        });

        it('uses highest quality language from headers if no cookie', async () => {
            const cookies = {
                get: vi.fn().mockReturnValue(undefined)
            } as unknown as ReadonlyRequestCookies;
            const headers = new Headers({
                'accept-language': 'cs;q=0.9,en-US;q=0.7,en;q=0.7'
            });
            const result = await getUserLocale(cookies, headers);
            expect(result).toBe('cs');
        });

        it('falls back to default locale if locale is not supported', async () => {
            const cookies = {
                get: vi.fn().mockReturnValue({ value: 'xy' })
            } as unknown as ReadonlyRequestCookies;
            const headers = new Headers();
            const result = await getUserLocale(cookies, headers);
            expect(result).toBe(DEFAULT_LOCALE);
        });
    });
});
