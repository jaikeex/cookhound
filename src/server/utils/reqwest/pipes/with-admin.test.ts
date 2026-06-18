import { describe, it, expect, vi, beforeEach } from 'vitest';

//|=============================================================================================|//
//$                                           MOCKS                                             $//
//|=============================================================================================|//

const REJECT_RESPONSE = { sentinel: 'rejected' };
const FORBIDDEN_RESPONSE = { sentinel: 'forbidden' };

vi.mock('@/server/utils/reqwest/context', () => ({
    RequestContext: {
        getUserId: vi.fn(),
        getUserRole: vi.fn()
    }
}));

vi.mock('./rejectUnauthenticated', () => ({
    rejectUnauthenticated: vi.fn(() => Promise.resolve(REJECT_RESPONSE))
}));

vi.mock('@/server/utils/reqwest/handleApiError', () => ({
    handleServerError: vi.fn(() => FORBIDDEN_RESPONSE)
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

import { withAdmin } from './with-admin';
import { RequestContext } from '@/server/utils/reqwest/context';
import { rejectUnauthenticated } from './rejectUnauthenticated';
import { handleServerError } from '@/server/utils/reqwest/handleApiError';
import { AuthErrorForbidden } from '@/server/error';
import { UserRole } from '@/common/types';

const mockRequestContext = vi.mocked(RequestContext);
const mockRejectUnauthenticated = vi.mocked(rejectUnauthenticated);
const mockHandleServerError = vi.mocked(handleServerError);

// The composed guard preserves the handler signature; for the test we only need
// to invoke it with a request-shaped arg, so a minimal call signature suffices.
type GuardCall = (req: unknown) => Promise<unknown>;

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('withAdmin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls the wrapped handler for an admin user', async () => {
        mockRequestContext.getUserId.mockReturnValue(1);
        mockRequestContext.getUserRole.mockReturnValue(UserRole.Admin);

        const handlerResponse = { ok: true };
        const handler = vi.fn(() => Promise.resolve(handlerResponse));

        const guarded = withAdmin(handler as never);
        const result = await (guarded as unknown as GuardCall)({});

        expect(handler).toHaveBeenCalledTimes(1);
        expect(result).toBe(handlerResponse);
        expect(mockRejectUnauthenticated).not.toHaveBeenCalled();
        expect(mockHandleServerError).not.toHaveBeenCalled();
    });

    it('rejects and tears down the session when there is no userId', async () => {
        mockRequestContext.getUserId.mockReturnValue(null);
        mockRequestContext.getUserRole.mockReturnValue(UserRole.Guest);

        const handler = vi.fn(() => Promise.resolve({ ok: true }));

        const guarded = withAdmin(handler as never);
        const result = await (guarded as unknown as GuardCall)({});

        expect(handler).not.toHaveBeenCalled();
        expect(mockRejectUnauthenticated).toHaveBeenCalledTimes(1);
        expect(result).toBe(REJECT_RESPONSE);
    });

    it('forbids an authenticated non-admin WITHOUT tearing down the session', async () => {
        mockRequestContext.getUserId.mockReturnValue(7);
        mockRequestContext.getUserRole.mockReturnValue(UserRole.User);

        const handler = vi.fn(() => Promise.resolve({ ok: true }));

        const guarded = withAdmin(handler as never);
        const result = await (guarded as unknown as GuardCall)({});

        expect(handler).not.toHaveBeenCalled();
        // A valid session that merely lacks the admin role must NOT be cleared.
        expect(mockRejectUnauthenticated).not.toHaveBeenCalled();
        expect(mockHandleServerError).toHaveBeenCalledTimes(1);
        expect(mockHandleServerError).toHaveBeenCalledWith(
            expect.any(AuthErrorForbidden)
        );
        expect(result).toBe(FORBIDDEN_RESPONSE);
    });
});
