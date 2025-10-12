import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RequestContext } from './requestContext';
import { UserRole } from '@/common/types';
import { createMockSession } from '@/server/utils/tests';

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

vi.mock('@/server/utils/session/manager', () => ({
    sessions: {
        validateSession: vi.fn()
    }
}));

vi.mock('@/common/utils', async (importOriginal) => {
    const actual: any = await importOriginal();
    return {
        ...actual,
        getUserLocale: vi.fn()
    };
});

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

import { sessions } from '@/server/utils/session/manager';
import { getUserLocale } from '@/common/utils';

const mockSessions = vi.mocked(sessions);
const mockGetUserLocale = vi.mocked(getUserLocale);

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('RequestContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCookieStore.get.mockReturnValue(undefined);
        mockGetUserLocale.mockResolvedValue('en');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    //~=========================================================================================~//
    //$                                      RUN METHOD                                         $//
    //~=========================================================================================~//

    describe('run', () => {
        it('should initialize context with all values from request', async () => {
            const mockRequest = new Request(
                'http://localhost:3000/test?query=1',
                {
                    method: 'POST',
                    headers: {
                        'user-agent': 'Test Browser',
                        'x-forwarded-for': '192.168.1.1'
                    }
                }
            );

            const mockSession = createMockSession({ userId: 1 });
            mockCookieStore.get.mockReturnValue({ value: 'session-token' });
            mockSessions.validateSession.mockResolvedValue(mockSession);
            mockGetUserLocale.mockResolvedValue('en');

            await RequestContext.run(mockRequest, () => {
                expect(RequestContext.getRequestMethod()).toBe('POST');
                expect(RequestContext.getRequestPath()).toBe('/test?query=1');
                expect(RequestContext.getUserAgent()).toBe('Test Browser');
                expect(RequestContext.getIp()).toBe('192.168.1.1');
                expect(RequestContext.getUserId()).toBe(1);
                expect(RequestContext.getUserRole()).toBe('user');
                expect(RequestContext.getSessionId()).toBe('test-session-id');
                expect(RequestContext.getUserLocale()).toBe('en');
                expect(RequestContext.getRequestId()).toBeTruthy();
            });
        });

        it('should extract IP from x-forwarded-for header', async () => {
            const mockRequest = new Request('http://localhost:3000/', {
                headers: {
                    'x-forwarded-for': '203.0.113.1, 198.51.100.1'
                }
            });

            await RequestContext.run(mockRequest, () => {
                expect(RequestContext.getIp()).toBe(
                    '203.0.113.1, 198.51.100.1'
                );
            });
        });

        it('should extract IP from x-real-ip header', async () => {
            const mockRequest = new Request('http://localhost:3000/', {
                headers: {
                    'x-real-ip': '198.51.100.5'
                }
            });

            await RequestContext.run(mockRequest, () => {
                expect(RequestContext.getIp()).toBe('198.51.100.5');
            });
        });

        it('should extract user agent from headers', async () => {
            const mockRequest = new Request('http://localhost:3000/', {
                headers: {
                    'user-agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            await RequestContext.run(mockRequest, () => {
                expect(RequestContext.getUserAgent()).toBe(
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                );
            });
        });

        it('should parse URL to get request path', async () => {
            const mockRequest = new Request(
                'http://localhost:3000/api/users/123?filter=active'
            );

            await RequestContext.run(mockRequest, () => {
                expect(RequestContext.getRequestPath()).toBe(
                    '/api/users/123?filter=active'
                );
            });
        });

        it('should set Guest role when no session', async () => {
            const mockRequest = new Request('http://localhost:3000/');
            mockCookieStore.get.mockReturnValue(undefined);

            await RequestContext.run(mockRequest, () => {
                expect(RequestContext.getUserRole()).toBe(UserRole.Guest);
                expect(RequestContext.getUserId()).toBeNull();
            });
        });

        it('should set Guest role when session validation fails', async () => {
            const mockRequest = new Request('http://localhost:3000/');
            mockCookieStore.get.mockReturnValue({ value: 'invalid-session' });
            mockSessions.validateSession.mockResolvedValue(null);

            await RequestContext.run(mockRequest, () => {
                expect(RequestContext.getUserRole()).toBe(UserRole.Guest);
                expect(RequestContext.getUserId()).toBeNull();
            });
        });

        it('should validate session and set userId/userRole', async () => {
            const mockRequest = new Request('http://localhost:3000/');
            const mockSession = createMockSession({
                userId: 42,
                userRole: UserRole.Admin
            });

            mockCookieStore.get.mockReturnValue({ value: 'valid-session' });
            mockSessions.validateSession.mockResolvedValue(mockSession);

            await RequestContext.run(mockRequest, () => {
                expect(RequestContext.getUserId()).toBe(42);
                expect(RequestContext.getUserRole()).toBe(UserRole.Admin);
                expect(RequestContext.getSessionId()).toBe('test-session-id');
            });
        });

        it('should handle URL parsing errors gracefully', async () => {
            const mockRequest = {
                url: 'not-a-valid-url',
                method: 'GET',
                headers: new Headers()
            } as Request;

            await RequestContext.run(mockRequest, () => {
                const path = RequestContext.getRequestPath();
                expect(path).toBe('PATH UNKNOWN');
            });
        });

        it('should handle locale fetching errors gracefully', async () => {
            const mockRequest = new Request('http://localhost:3000/');
            mockGetUserLocale.mockRejectedValue(new Error('Locale error'));

            await RequestContext.run(mockRequest, () => {
                const locale = RequestContext.getUserLocale();
                expect(locale).toBe('cs');
            });
        });

        it('should never throw - continues with partial data on errors', async () => {
            const mockRequest = new Request('http://localhost:3000/');
            mockSessions.validateSession.mockRejectedValue(
                new Error('Session error')
            );

            // Should not throw
            await expect(
                RequestContext.run(mockRequest, () => {
                    expect(RequestContext.getRequestId()).toBeTruthy();
                })
            ).resolves.not.toThrow();
        });

        it('should generate unique request IDs', async () => {
            const mockRequest = new Request('http://localhost:3000/');
            const requestIds: string[] = [];

            await RequestContext.run(mockRequest, () => {
                const id1 = RequestContext.getRequestId();
                requestIds.push(id1!);
            });

            await RequestContext.run(mockRequest, () => {
                const id2 = RequestContext.getRequestId();
                requestIds.push(id2!);
            });

            expect(requestIds[0]).not.toBe(requestIds[1]);
            expect(requestIds[0]).toBeTruthy();
            expect(requestIds[1]).toBeTruthy();
        });
    });

    //~=========================================================================================~//
    //$                                         GETTERS                                         $//
    //~=========================================================================================~//

    describe('Getters', () => {
        it('should return null/undefined when context not set', () => {
            expect(RequestContext.getUserId()).toBeNull();
            expect(RequestContext.getUserRole()).toBeNull();
            expect(RequestContext.getIp()).toBeNull();
            expect(RequestContext.getUserAgent()).toBeNull();
            expect(RequestContext.getSessionId()).toBeNull();
            expect(RequestContext.getRequestId()).toBeNull();
            expect(RequestContext.getUserLocale()).toBeNull();
            expect(RequestContext.getRequestPath()).toBeUndefined();
            expect(RequestContext.getRequestMethod()).toBeUndefined();
        });

        it('should return correct values from context', async () => {
            const mockRequest = new Request('http://localhost:3000/test', {
                method: 'DELETE',
                headers: {
                    'user-agent': 'Test Agent',
                    'x-real-ip': '10.0.0.1'
                }
            });

            const mockSession = createMockSession({
                userId: 99,
                userRole: UserRole.User
            });
            mockCookieStore.get.mockReturnValue({ value: 'session' });
            mockSessions.validateSession.mockResolvedValue(mockSession);

            await RequestContext.run(mockRequest, () => {
                expect(RequestContext.getUserId()).toBe(99);
                expect(RequestContext.getUserRole()).toBe(UserRole.User);
                expect(RequestContext.getIp()).toBe('10.0.0.1');
                expect(RequestContext.getUserAgent()).toBe('Test Agent');
                expect(RequestContext.getRequestMethod()).toBe('DELETE');
                expect(RequestContext.getRequestPath()).toBe('/test');
            });
        });
    });

    //~=========================================================================================~//
    //$                                         SETTERS                                         $//
    //~=========================================================================================~//

    describe('Setters', () => {
        it('should successfully update context values', async () => {
            const mockRequest = new Request('http://localhost:3000/');

            await RequestContext.run(mockRequest, () => {
                RequestContext.setUserId(123);
                RequestContext.setUserRole(UserRole.Admin);
                RequestContext.setIp('1.2.3.4');
                RequestContext.setUserAgent('Custom Agent');
                RequestContext.setSessionId('custom-session');
                RequestContext.setRequestPath('/custom/path');
                RequestContext.setRequestMethod('PATCH');

                expect(RequestContext.getUserId()).toBe(123);
                expect(RequestContext.getUserRole()).toBe(UserRole.Admin);
                expect(RequestContext.getIp()).toBe('1.2.3.4');
                expect(RequestContext.getUserAgent()).toBe('Custom Agent');
                expect(RequestContext.getSessionId()).toBe('custom-session');
                expect(RequestContext.getRequestPath()).toBe('/custom/path');
                expect(RequestContext.getRequestMethod()).toBe('PATCH');
            });
        });

        it('should handle missing store gracefully', () => {
            expect(() => RequestContext.setUserId(1)).not.toThrow();
            expect(() =>
                RequestContext.setUserRole(UserRole.User)
            ).not.toThrow();
            expect(() => RequestContext.setIp('1.2.3.4')).not.toThrow();
        });
    });

    //~=========================================================================================~//
    //$                                    CONTEXT ISOLATION                                    $//
    //~=========================================================================================~//

    describe('Context Isolation', () => {
        it('should isolate contexts between different requests', async () => {
            const request1 = new Request('http://localhost:3000/request1');
            const request2 = new Request('http://localhost:3000/request2');

            await RequestContext.run(request1, async () => {
                RequestContext.setUserId(100);
                expect(RequestContext.getUserId()).toBe(100);

                await RequestContext.run(request2, () => {
                    RequestContext.setUserId(200);
                    expect(RequestContext.getUserId()).toBe(200);
                });

                expect(RequestContext.getUserId()).toBe(100);
            });
        });

        it('should not leak data between sequential requests', async () => {
            const request1 = new Request('http://localhost:3000/');
            const request2 = new Request('http://localhost:3000/');

            await RequestContext.run(request1, () => {
                RequestContext.setUserId(1);
                RequestContext.setUserRole(UserRole.Admin);
                expect(RequestContext.getUserId()).toBe(1);
            });

            await RequestContext.run(request2, () => {
                expect(RequestContext.getUserId()).toBeNull();
            });
        });

        it('should maintain context across async operations', async () => {
            const mockRequest = new Request('http://localhost:3000/');

            await RequestContext.run(mockRequest, async () => {
                RequestContext.setUserId(42);

                await new Promise((resolve) => setTimeout(resolve, 10));

                expect(RequestContext.getUserId()).toBe(42);

                await Promise.resolve();

                expect(RequestContext.getUserId()).toBe(42);
            });
        });
    });
});
