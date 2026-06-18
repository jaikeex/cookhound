import { describe, it, expect, vi, beforeEach } from 'vitest';

//|=============================================================================================|//
//$                                           MOCKS                                             $//
//|=============================================================================================|//

// notFound() / redirect() throw special navigation signals in Next; mock them
// to throw identifiable errors so we can assert which branch ran.
vi.mock('next/navigation', () => ({
    notFound: vi.fn(() => {
        throw new Error('NEXT_NOT_FOUND');
    }),
    redirect: vi.fn(() => {
        throw new Error('NEXT_REDIRECT');
    })
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

import { mapServiceErrorForRsc } from './mapError';
import {
    NotFoundError,
    AuthErrorUnauthorized,
    AuthErrorForbidden,
    ValidationError
} from '@/server/error';
import { notFound, redirect } from 'next/navigation';

const mockNotFound = vi.mocked(notFound);
const mockRedirect = vi.mocked(redirect);

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('mapServiceErrorForRsc', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('maps NotFoundError to notFound()', () => {
        expect(() =>
            mapServiceErrorForRsc(new NotFoundError(), '/user/1')
        ).toThrow('NEXT_NOT_FOUND');

        expect(mockNotFound).toHaveBeenCalledTimes(1);
        expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('maps AuthErrorUnauthorized to the login-wall redirect', () => {
        expect(() =>
            mapServiceErrorForRsc(new AuthErrorUnauthorized(), '/user/1')
        ).toThrow('NEXT_REDIRECT');

        expect(mockRedirect).toHaveBeenCalledTimes(1);
        const target = mockRedirect.mock.calls[0]![0] as string;
        expect(target).toContain('/error/restricted');
        expect(target).toContain('anonymous=true');
        expect(target).toContain('target=%2Fuser%2F1');
        expect(mockNotFound).not.toHaveBeenCalled();
    });

    it('maps AuthErrorForbidden to the login-wall redirect', () => {
        expect(() =>
            mapServiceErrorForRsc(new AuthErrorForbidden(), '/admin')
        ).toThrow('NEXT_REDIRECT');

        expect(mockRedirect).toHaveBeenCalledTimes(1);
    });

    it('rethrows any other error untouched', () => {
        const original = new ValidationError();

        expect(() => mapServiceErrorForRsc(original, '/x')).toThrow(original);
        expect(mockNotFound).not.toHaveBeenCalled();
        expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('rethrows non-Error values untouched', () => {
        expect(() => mapServiceErrorForRsc('boom', '/x')).toThrow('boom');
    });
});
