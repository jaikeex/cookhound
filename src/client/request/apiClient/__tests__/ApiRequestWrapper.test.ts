import { afterEach, describe, expect, it, vi } from 'vitest';
import { CLIENT_ERROR_CODE, RequestError } from '@/client/error';
import type * as Constants from '@/common/constants';
import { apiRequestWrapper } from '@/client/request/apiClient/ApiRequestWrapper';

vi.mock('@/common/constants', async (importOriginal) => {
    const actual = await importOriginal<typeof Constants>();

    return {
        ...actual,
        ENV_CONFIG_PUBLIC: {
            ...actual.ENV_CONFIG_PUBLIC,
            API_URL: 'http://localhost:3000/api'
        }
    };
});

const mockFetch = (impl: () => Promise<Response>) =>
    vi.stubGlobal('fetch', vi.fn(impl));

const captureError = (promise: Promise<unknown>) =>
    promise.then(
        () => {
            throw new Error('expected the request to reject');
        },
        (error: unknown) => error
    );

describe('ApiRequestWrapper error normalization', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should return the parsed body of a successful response', async () => {
        mockFetch(async () => Response.json({ id: 1 }));

        await expect(
            apiRequestWrapper.get({ url: '/recipes/1' })
        ).resolves.toEqual({
            id: 1
        });
    });

    it('should turn a fetch rejection into a network RequestError', async () => {
        const cause = new TypeError('Failed to fetch');
        mockFetch(async () => {
            throw cause;
        });

        const error = await captureError(
            apiRequestWrapper.get({ url: '/recipes/1' })
        );

        expect(error).toBeInstanceOf(RequestError);
        expect(error).toMatchObject({
            message: 'app.error.network',
            status: 0,
            code: CLIENT_ERROR_CODE.NETWORK,
            cause
        });
    });

    it('should rethrow an abort untouched so react-query sees a cancellation', async () => {
        const controller = new AbortController();
        const abortError = new DOMException('Aborted', 'AbortError');
        mockFetch(async () => {
            controller.abort();
            throw abortError;
        });

        const error = await captureError(
            apiRequestWrapper.get({
                url: '/recipes/1',
                signal: controller.signal
            })
        );

        expect(error).toBe(abortError);
    });

    it('should map a non-JSON error body to a status message', async () => {
        mockFetch(
            async () =>
                new Response('<html>502 Bad Gateway</html>', { status: 502 })
        );

        const error = await captureError(
            apiRequestWrapper.get({ url: '/recipes/1' })
        );

        expect(error).toBeInstanceOf(RequestError);
        expect(error).toMatchObject({
            message: 'app.error.infrastructure',
            status: 502
        });
    });

    it('should carry a server ErrorResponse through', async () => {
        mockFetch(async () =>
            Response.json(
                {
                    title: 'error',
                    message: 'app.error.not-found',
                    status: 404,
                    code: 'RECIPE_NOT_FOUND',
                    requestId: 'req-1',
                    timestamp: '2026-01-01T00:00:00.000Z'
                },
                { status: 404 }
            )
        );

        const error = await captureError(
            apiRequestWrapper.get({ url: '/recipes/1' })
        );

        expect(error).toMatchObject({
            message: 'app.error.not-found',
            status: 404,
            code: 'RECIPE_NOT_FOUND',
            requestId: 'req-1'
        });
    });
});
