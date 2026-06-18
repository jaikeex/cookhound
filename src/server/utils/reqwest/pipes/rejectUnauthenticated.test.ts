import { describe, it, expect, vi, beforeEach } from 'vitest';

//|=============================================================================================|//
//$                                           MOCKS                                             $//
//|=============================================================================================|//

const SENTINEL_RESPONSE = { sentinel: 'unauthorized' };

vi.mock('@/server/utils/session', () => ({
    deleteSessionCookie: vi.fn(() => Promise.resolve())
}));

vi.mock('@/server/utils/reqwest/handleApiError', () => ({
    handleServerError: vi.fn(() => SENTINEL_RESPONSE)
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

import { rejectUnauthenticated } from './rejectUnauthenticated';
import { deleteSessionCookie } from '@/server/utils/session';
import { handleServerError } from '@/server/utils/reqwest/handleApiError';
import { AuthErrorUnauthorized } from '@/server/error';

const mockDeleteSessionCookie = vi.mocked(deleteSessionCookie);
const mockHandleServerError = vi.mocked(handleServerError);

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('rejectUnauthenticated', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('tears down the session cookie and returns the 401 error response', async () => {
        const result = await rejectUnauthenticated();

        expect(mockDeleteSessionCookie).toHaveBeenCalledTimes(1);
        expect(mockHandleServerError).toHaveBeenCalledTimes(1);
        expect(mockHandleServerError).toHaveBeenCalledWith(
            expect.any(AuthErrorUnauthorized)
        );
        expect(result).toBe(SENTINEL_RESPONSE);
    });

    it('awaits the cookie deletion before building the response', async () => {
        const order: string[] = [];

        mockDeleteSessionCookie.mockImplementationOnce(async () => {
            await Promise.resolve();
            order.push('delete');
        });
        mockHandleServerError.mockImplementationOnce(() => {
            order.push('respond');
            return SENTINEL_RESPONSE as never;
        });

        await rejectUnauthenticated();

        // The Set-Cookie teardown must be flushed before the response is built.
        expect(order).toEqual(['delete', 'respond']);
    });
});
