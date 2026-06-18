import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SESSION_COOKIE_NAME } from '@/common/constants/general';

//|=============================================================================================|//
//$                                           MOCKS                                             $//
//|=============================================================================================|//

const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn()
};

vi.mock('next/headers', () => ({
    cookies: vi.fn(() => Promise.resolve(mockCookieStore))
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

import { deleteSessionCookie } from './cookie';

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('deleteSessionCookie', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deletes the session cookie from the store', async () => {
        await deleteSessionCookie();

        expect(mockCookieStore.delete).toHaveBeenCalledWith(
            expect.objectContaining({ name: SESSION_COOKIE_NAME })
        );
    });
});
