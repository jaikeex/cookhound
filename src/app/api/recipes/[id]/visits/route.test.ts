// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/server/utils/tests/helpers';

//|=============================================================================================|//
//?                                           MOCKS                                             ?//
//|=============================================================================================|//

/**
 * Unwrap `makeHandler` so the raw handler runs without the request-context /
 * origin / rate-limit pipeline, and stub the body reader — but keep the REAL
 * strict-schema validation so the test genuinely exercises the payload guard
 * (a spoofed `userId` must be rejected by `z.strictObject({})`).
 */
vi.mock('@/server/utils/reqwest', () => ({
    makeHandler: (handler: unknown) => handler,
    readJson: vi.fn(),
    created: (data: unknown, init?: unknown) => ({ data, init }),
    validateParams: (
        schema: { safeParse: (v: unknown) => any },
        params: unknown
    ) => {
        const result = schema.safeParse(params);
        if (!result.success) throw new Error('params validation failed');
        return result.data;
    },
    validatePayload: (
        schema: { safeParse: (v: unknown) => any },
        payload: unknown
    ) => {
        const result = schema.safeParse(payload);
        if (!result.success) throw new Error('payload validation failed');
        return result.data;
    }
}));

vi.mock('@/server/utils/reqwest/context', () => ({
    RequestContext: { getUserId: vi.fn() }
}));

vi.mock('@/server/services/recipe/service', () => ({
    recipeService: { registerRecipeVisit: vi.fn().mockResolvedValue(undefined) }
}));

vi.mock('@/server/utils/rate-limit', () => ({
    withRateLimit: () => (handler: unknown) => handler
}));

vi.mock('@/server/utils/api-docs/registry', () => ({
    registerRouteDocs: vi.fn()
}));

import { POST } from './route';
import { readJson } from '@/server/utils/reqwest';
import { RequestContext } from '@/server/utils/reqwest/context';
import { recipeService } from '@/server/services/recipe/service';

const mockReadJson = vi.mocked(readJson);
const mockGetUserId = vi.mocked(RequestContext.getUserId);
const mockRegisterVisit = vi.mocked(recipeService.registerRecipeVisit);

const buildRequest = () =>
    createMockRequest({
        url: 'http://localhost:3000/api/recipes/42/visits',
        method: 'POST'
    }) as any;

//|=============================================================================================|//
//?                                           TESTS                                             ?//
//|=============================================================================================|//

describe('POST /api/recipes/[id]/visits', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('derives the viewer from the session, never the request body (IDOR guard)', async () => {
        mockReadJson.mockResolvedValue({});
        mockGetUserId.mockReturnValue(7);

        await POST(buildRequest());

        // The recipe id comes from the path; the viewer id comes from the
        // authenticated context — not from anything the caller could send.
        expect(mockRegisterVisit).toHaveBeenCalledWith(42, 7);
    });

    it('records an anonymous visit as null when there is no session', async () => {
        mockReadJson.mockResolvedValue({});
        mockGetUserId.mockReturnValue(null);

        await POST(buildRequest());

        expect(mockRegisterVisit).toHaveBeenCalledWith(42, null);
    });

    it('rejects a body that smuggles a userId and never touches the service', async () => {
        // An anonymous attacker trying to write to victim id 999's history.
        mockReadJson.mockResolvedValue({ userId: 999 });
        mockGetUserId.mockReturnValue(null);

        await expect(POST(buildRequest())).rejects.toThrow();
        expect(mockRegisterVisit).not.toHaveBeenCalled();
    });
});
