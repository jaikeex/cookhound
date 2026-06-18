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

vi.mock('@/server/utils/reqwest/context', () => ({
    RequestContext: {
        getOrigin: vi.fn()
    }
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

import { deleteSessionCookie } from './cookie';
import { RequestContext } from '@/server/utils/reqwest/context';

const mockCtx = vi.mocked(RequestContext);

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('deleteSessionCookie', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deletes the session cookie when origin is route', async () => {
        mockCtx.getOrigin.mockReturnValue('route');

        await deleteSessionCookie();

        expect(mockCookieStore.delete).toHaveBeenCalledWith(
            SESSION_COOKIE_NAME
        );
    });

    it('skips cookie mutation during an RSC render', async () => {
        mockCtx.getOrigin.mockReturnValue('render');

        await deleteSessionCookie();

        expect(mockCookieStore.delete).not.toHaveBeenCalled();
    });
});
