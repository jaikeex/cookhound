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

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

import { setCookie, deleteCookie } from './cookies';

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('setCookie', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('merges the shared attributes with the per-call options', async () => {
        await setCookie('locale', 'en', { maxAge: 100, sameSite: 'strict' });

        expect(mockCookieStore.set).toHaveBeenCalledWith(
            'locale',
            'en',
            expect.objectContaining({
                path: '/',
                maxAge: 100,
                sameSite: 'strict'
            })
        );

        // The app-wide shared attributes are always applied.
        const options = mockCookieStore.set.mock.calls[0]![2];
        expect(options).toHaveProperty('secure');
        expect(options).toHaveProperty('domain');
    });

    it('lets per-call options override a shared default', async () => {
        await setCookie('x', 'y', { path: '/scoped' });

        const options = mockCookieStore.set.mock.calls[0]![2];
        expect(options.path).toBe('/scoped');
    });

    it('applies the shared defaults when no per-call options are given', async () => {
        await setCookie('x', 'y');

        expect(mockCookieStore.set).toHaveBeenCalledWith(
            'x',
            'y',
            expect.objectContaining({ path: '/' })
        );
    });
});

describe('deleteCookie', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('delegates to the store delete with the shared path/domain so the cookie actually clears', async () => {
        await deleteCookie('session');

        expect(mockCookieStore.delete).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'session', path: '/' })
        );

        // The shared domain must be mirrored on deletion or a domain-scoped
        // cookie would survive in the browser.
        const arg = mockCookieStore.delete.mock.calls[0]![0];
        expect(arg).toHaveProperty('domain');
    });
});
