import { describe, it, expect, vi, beforeEach } from 'vitest';

//|=============================================================================================|//
//$                                           MOCKS                                             $//
//|=============================================================================================|//

const REJECT_RESPONSE = { sentinel: 'rejected' };

vi.mock('@/server/utils/reqwest/context', () => ({
    RequestContext: {
        getUserId: vi.fn(),
        getUserRole: vi.fn()
    }
}));

vi.mock('./rejectUnauthenticated', () => ({
    rejectUnauthenticated: vi.fn(() => Promise.resolve(REJECT_RESPONSE))
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

import { withAuth } from './with-auth';
import { RequestContext } from '@/server/utils/reqwest/context';
import { rejectUnauthenticated } from './rejectUnauthenticated';
import { UserRole } from '@/common/types';

const mockRequestContext = vi.mocked(RequestContext);
const mockRejectUnauthenticated = vi.mocked(rejectUnauthenticated);

// The composed guard preserves the handler signature; for the test we only need
// to invoke it with a request-shaped arg, so a minimal call signature suffices.
type GuardCall = (req: unknown) => Promise<unknown>;

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('withAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls the wrapped handler for an authenticated user', async () => {
        mockRequestContext.getUserId.mockReturnValue(1);
        mockRequestContext.getUserRole.mockReturnValue(UserRole.User);

        const handlerResponse = { ok: true };
        const handler = vi.fn(() => Promise.resolve(handlerResponse));

        const guarded = withAuth(handler as never);
        const result = await (guarded as unknown as GuardCall)({});

        expect(handler).toHaveBeenCalledTimes(1);
        expect(result).toBe(handlerResponse);
        expect(mockRejectUnauthenticated).not.toHaveBeenCalled();
    });

    it('rejects and tears down the session when there is no userId', async () => {
        mockRequestContext.getUserId.mockReturnValue(null);
        mockRequestContext.getUserRole.mockReturnValue(UserRole.Guest);

        const handler = vi.fn(() => Promise.resolve({ ok: true }));

        const guarded = withAuth(handler as never);
        const result = await (guarded as unknown as GuardCall)({});

        expect(handler).not.toHaveBeenCalled();
        expect(mockRejectUnauthenticated).toHaveBeenCalledTimes(1);
        expect(result).toBe(REJECT_RESPONSE);
    });

    it('rejects a Guest role even when a userId is present', async () => {
        mockRequestContext.getUserId.mockReturnValue(5);
        mockRequestContext.getUserRole.mockReturnValue(UserRole.Guest);

        const handler = vi.fn(() => Promise.resolve({ ok: true }));

        const guarded = withAuth(handler as never);
        await (guarded as unknown as GuardCall)({});

        expect(handler).not.toHaveBeenCalled();
        expect(mockRejectUnauthenticated).toHaveBeenCalledTimes(1);
    });
});
