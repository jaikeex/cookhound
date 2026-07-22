import { describe, it, expect, vi, beforeEach } from 'vitest';

//|=============================================================================================|//
//$                                           MOCKS                                             $//
//|=============================================================================================|//

vi.mock('@/server/utils/reqwest/context', () => ({
    RequestContext: {
        getRequestId: vi.fn()
    }
}));

vi.mock('@/server/utils/reqwest/context/httpContext', () => ({
    // Default passthrough so the wrapped fn actually runs.
    runContextFromHeaders: vi.fn((fn: () => unknown) => Promise.resolve(fn()))
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

import { ensureRenderContext } from './ensureContext';
import { RequestContext } from '@/server/utils/reqwest/context';
import { runContextFromHeaders } from '@/server/utils/reqwest/context/httpContext';

const mockCtx = vi.mocked(RequestContext);
const mockRunContextFromHeaders = vi.mocked(runContextFromHeaders);

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

beforeEach(() => {
    vi.clearAllMocks();
    mockRunContextFromHeaders.mockImplementation((fn: () => unknown) =>
        Promise.resolve(fn())
    );
});

describe('ensureRenderContext', () => {
    it('reuses an already-active context without rebuilding', async () => {
        mockCtx.getRequestId.mockReturnValue('existing-request-id');

        const fn = vi.fn().mockResolvedValue('reused');
        const result = await ensureRenderContext(fn);

        expect(result).toBe('reused');
        expect(fn).toHaveBeenCalledTimes(1);
        expect(mockRunContextFromHeaders).not.toHaveBeenCalled();
    });

    it('builds a context when none is active', async () => {
        mockCtx.getRequestId.mockReturnValue(null);

        const fn = vi.fn().mockResolvedValue('built');
        const result = await ensureRenderContext(fn);

        expect(result).toBe('built');
        expect(mockRunContextFromHeaders).toHaveBeenCalledTimes(1);
    });

    it('propagates the resolved value through the new context', async () => {
        mockCtx.getRequestId.mockReturnValue(null);

        const result = await ensureRenderContext(async () => 42);

        expect(result).toBe(42);
    });

    it('builds the context via runContextFromHeaders with just the work fn', async () => {
        mockCtx.getRequestId.mockReturnValue(null);

        await ensureRenderContext(async () => 'x');

        expect(mockRunContextFromHeaders).toHaveBeenCalledWith(
            expect.any(Function)
        );
    });
});
