// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRunOnce } from './hook';

describe('useRunOnce', () => {
    it('runs the callback on mount', () => {
        const callback = vi.fn();

        renderHook(() => useRunOnce(callback));

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not run again when a dependency changes', () => {
        const callback = vi.fn();

        const { rerender } = renderHook(
            ({ dep }: { dep: number }) => useRunOnce(callback, [dep]),
            { initialProps: { dep: 0 } }
        );

        rerender({ dep: 1 });
        rerender({ dep: 2 });

        expect(callback).toHaveBeenCalledTimes(1);
    });

    /**
     * The guard tracks invocations, not effective invocations: the ref is set
     * as soon as the callback has been called, whatever the callback did. A
     * callback that bails out early therefore spends the single run, and no
     * later dependency change can win it back.
     *
     * Worth a test because the failure is silent and the shape is tempting -
     * `useRunOnce(() => { if (!ready) return; … }, [ready])` reads like it
     * defers the work until `ready`, and instead cancels it for good.
     */
    it('spends its single run on a callback that returns early', () => {
        const effect = vi.fn();

        const { rerender } = renderHook(
            ({ ready }: { ready: boolean }) =>
                useRunOnce(() => {
                    if (!ready) return;
                    effect();
                }, [ready]),
            { initialProps: { ready: false } }
        );

        expect(effect).not.toHaveBeenCalled();

        rerender({ ready: true });

        expect(effect).not.toHaveBeenCalled();
    });
});
