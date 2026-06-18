import { describe, it, expect, vi, beforeEach } from 'vitest';

//|=============================================================================================|//
//$                                           MOCKS                                             $//
//|=============================================================================================|//

vi.mock('@/server/utils/reqwest/context', () => ({
    RequestContext: {
        getRequestId: vi.fn(),
        // Default passthrough so the wrapped fn actually runs.
        runFromHeaders: vi.fn((fn: () => unknown) => Promise.resolve(fn()))
    }
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

import { ensureRenderContext } from './ensureContext';
import { RequestContext } from '@/server/utils/reqwest/context';

const mockCtx = vi.mocked(RequestContext);

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

beforeEach(() => {
    vi.clearAllMocks();
    mockCtx.runFromHeaders.mockImplementation((fn: () => unknown) =>
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
        expect(mockCtx.runFromHeaders).not.toHaveBeenCalled();
    });

    it('builds a context when none is active', async () => {
        mockCtx.getRequestId.mockReturnValue(null);

        const fn = vi.fn().mockResolvedValue('built');
        const result = await ensureRenderContext(fn);

        expect(result).toBe('built');
        expect(mockCtx.runFromHeaders).toHaveBeenCalledTimes(1);
    });

    it('propagates the resolved value through the new context', async () => {
        mockCtx.getRequestId.mockReturnValue(null);

        const result = await ensureRenderContext(async () => 42);

        expect(result).toBe(42);
    });

    it('stamps a freshly built context with the render origin', async () => {
        mockCtx.getRequestId.mockReturnValue(null);

        await ensureRenderContext(async () => 'x');

        expect(mockCtx.runFromHeaders).toHaveBeenCalledWith(
            expect.any(Function),
            'render'
        );
    });
});
