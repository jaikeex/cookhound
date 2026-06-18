import { describe, it, expect, vi, beforeEach } from 'vitest';

//|=============================================================================================|//
//$                                           MOCKS                                             $//
//|=============================================================================================|//

const mockCookieStore = {
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn()
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

import { mutableCookies } from './cookies';
import { RequestContext } from '@/server/utils/reqwest/context';

const mockCtx = vi.mocked(RequestContext);

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('mutableCookies', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('route origin', () => {
        beforeEach(() => {
            mockCtx.getOrigin.mockReturnValue('route');
        });

        it('returns the real store so mutations apply', async () => {
            const store = await mutableCookies();

            store.set('a', 'b');
            store.delete('a');

            expect(mockCookieStore.set).toHaveBeenCalledWith('a', 'b');
            expect(mockCookieStore.delete).toHaveBeenCalledWith('a');
        });

        it('passes reads straight through', async () => {
            mockCookieStore.get.mockReturnValue({ value: 'x' });

            const store = await mutableCookies();

            expect(store.get('session')).toEqual({ value: 'x' });
            expect(mockCookieStore.get).toHaveBeenCalledWith('session');
        });
    });

    describe('render origin', () => {
        beforeEach(() => {
            mockCtx.getOrigin.mockReturnValue('render');
        });

        it('turns mutations into no-ops instead of throwing', async () => {
            const store = await mutableCookies();

            expect(() => {
                store.set('a', 'b');
                store.delete('a');
            }).not.toThrow();

            expect(mockCookieStore.set).not.toHaveBeenCalled();
            expect(mockCookieStore.delete).not.toHaveBeenCalled();
        });

        it('keeps reads live during a render', async () => {
            mockCookieStore.get.mockReturnValue({ value: 'live' });

            const store = await mutableCookies();

            expect(store.get('session')).toEqual({ value: 'live' });
            expect(mockCookieStore.get).toHaveBeenCalledWith('session');
        });
    });
});
