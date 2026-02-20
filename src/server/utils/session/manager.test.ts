import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserRole, Status } from '@/common/types';
import {
    createMockSession,
    futureDate,
    pastDate,
    setupRedisMocks
} from '@/server/utils/tests';
import { ValidationError, InfrastructureError } from '@/server/error';
import {
    ONE_MONTH_IN_SECONDS,
    ONE_HOUR_IN_SECONDS
} from '@/common/constants/time';

//|=============================================================================================|//
//$                                           MOCKS                                             $//
//|=============================================================================================|//

const mockRedisClient = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn()
};

vi.mock('@/server/integrations/redis', () => ({
    redisClient: mockRedisClient
}));

vi.mock('@/server/logger', () => ({
    Logger: {
        getInstance: vi.fn(() => ({
            trace: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        }))
    }
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

let SessionManager: any;

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('SessionManager', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        setupRedisMocks(mockRedisClient);

        const imported = await import('./manager');
        SessionManager = imported.sessions;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    //~=========================================================================================~//
    //$                                      CREATE SESSION                                     $//
    //~=========================================================================================~//

    describe('createSession', () => {
        const validOptions = {
            userRole: UserRole.User,
            status: Status.Active,
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0 Test Browser',
            loginMethod: 'manual' as const
        };

        it('should successfully create session with correct TTL', async () => {
            mockRedisClient.set.mockResolvedValue('OK');

            const sessionId = await SessionManager.createSession(
                1,
                validOptions
            );

            expect(sessionId).toBeTruthy();
            expect(typeof sessionId).toBe('string');
            expect(sessionId.length).toBeGreaterThan(0);

            expect(mockRedisClient.set).toHaveBeenCalledWith(
                expect.stringContaining('session:'),
                expect.objectContaining({
                    userId: 1,
                    userRole: UserRole.User,
                    status: Status.Active
                }),
                ONE_MONTH_IN_SECONDS
            );
        });

        it('should store session data in correct Redis keys', async () => {
            mockRedisClient.set.mockResolvedValue('OK');
            mockRedisClient.get.mockResolvedValue([]);

            const sessionId = await SessionManager.createSession(
                1,
                validOptions
            );

            expect(mockRedisClient.set).toHaveBeenCalledWith(
                `session:${sessionId}`,
                expect.any(Object),
                ONE_MONTH_IN_SECONDS
            );

            expect(mockRedisClient.set).toHaveBeenCalledWith(
                'user_sessions:1',
                expect.arrayContaining([sessionId]),
                ONE_MONTH_IN_SECONDS
            );
        });

        it('should generate valid session ID', async () => {
            mockRedisClient.set.mockResolvedValue('OK');

            const sessionId1 = await SessionManager.createSession(
                1,
                validOptions
            );
            const sessionId2 = await SessionManager.createSession(
                1,
                validOptions
            );

            expect(sessionId1).toBeTruthy();
            expect(sessionId2).toBeTruthy();
            expect(sessionId1).not.toBe(sessionId2);
        });

        it('should throw ValidationError for invalid userId (0)', async () => {
            await expect(
                SessionManager.createSession(0, validOptions)
            ).rejects.toThrow(ValidationError);

            expect(mockRedisClient.set).not.toHaveBeenCalled();
        });

        it('should throw ValidationError for invalid userId (negative)', async () => {
            await expect(
                SessionManager.createSession(-1, validOptions)
            ).rejects.toThrow(ValidationError);

            expect(mockRedisClient.set).not.toHaveBeenCalled();
        });

        it('should validate all session options are stored correctly', async () => {
            mockRedisClient.set.mockResolvedValue('OK');

            const options = {
                userRole: UserRole.Admin,
                status: Status.Active,
                ipAddress: '192.168.1.100',
                userAgent: 'Custom User Agent',
                loginMethod: 'google' as const
            };

            await SessionManager.createSession(42, options);

            expect(mockRedisClient.set).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    userId: 42,
                    userRole: UserRole.Admin,
                    status: Status.Active,
                    ipAddress: '192.168.1.100',
                    userAgent: 'Custom User Agent',
                    loginMethod: 'google'
                }),
                ONE_MONTH_IN_SECONDS
            );
        });

        it('should add session to existing user sessions', async () => {
            const existingSessions = [
                'existing-session-1',
                'existing-session-2'
            ];

            mockRedisClient.get.mockImplementation((key) => {
                if (key === 'user_sessions:1') {
                    return Promise.resolve([...existingSessions]);
                }
                return Promise.resolve(null);
            });
            mockRedisClient.set.mockResolvedValue('OK');

            const newSessionId = await SessionManager.createSession(
                1,
                validOptions
            );

            const userSessionsCalls = mockRedisClient.set.mock.calls.filter(
                (call) => call[0] === 'user_sessions:1'
            );

            expect(userSessionsCalls.length).toBeGreaterThan(0);

            const lastUserSessionsCall =
                userSessionsCalls[userSessionsCalls.length - 1];

            expect(lastUserSessionsCall?.[1]).toEqual([
                ...existingSessions,
                newSessionId
            ]);
            expect(lastUserSessionsCall?.[2]).toBe(ONE_MONTH_IN_SECONDS);
        });
    });

    //~=========================================================================================~//
    //$                                    VALIDATE SESSION                                     $//
    //~=========================================================================================~//

    describe('validateSession', () => {
        it('should return valid session for existing session ID', async () => {
            const mockSession = createMockSession({
                sessionId: 'test-session'
            });
            mockRedisClient.get.mockResolvedValue(mockSession);
            mockRedisClient.set.mockResolvedValue('OK');

            const result = await SessionManager.validateSession('test-session');

            expect(result).toBeTruthy();
            expect(result?.userId).toBe(mockSession.userId);
            expect(result?.sessionId).toBe('test-session');
        });

        it('should return null for non-existent session', async () => {
            mockRedisClient.get.mockResolvedValue(null);

            const result = await SessionManager.validateSession('non-existent');

            expect(result).toBeNull();
        });

        it('should return null for expired session', async () => {
            const expiredSession = createMockSession({
                expiresAt: pastDate(1),
                sessionId: 'expired-session',
                userId: 1
            });
            const userSessions = ['expired-session', 'other-session'];

            mockRedisClient.get
                .mockResolvedValueOnce(expiredSession) // First call for session
                .mockResolvedValueOnce(userSessions); // Second call for user sessions
            mockRedisClient.set.mockResolvedValue('OK');
            mockRedisClient.del.mockResolvedValue(1);

            const result =
                await SessionManager.validateSession('expired-session');

            expect(result).toBeNull();
        });

        it('should extend session TTL when within activity window', async () => {
            const recentlyAccessedSession = createMockSession({
                lastAccessedAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
            });
            mockRedisClient.get.mockResolvedValue(recentlyAccessedSession);
            mockRedisClient.set.mockResolvedValue('OK');

            await SessionManager.validateSession('test-session');

            const setCalls = mockRedisClient.set.mock.calls;
            const ttlExtensionCall = setCalls.find(
                (call) =>
                    call[0] === 'session:test-session' &&
                    call[2] === ONE_MONTH_IN_SECONDS
            );

            // Within activity window, should not extend
            expect(ttlExtensionCall).toBeUndefined();
        });

        it('should not extend TTL when outside activity window', async () => {
            const oldAccessSession = createMockSession({
                lastAccessedAt: new Date(
                    Date.now() - 2 * ONE_HOUR_IN_SECONDS * 1000
                ) // 2 hours
            });
            mockRedisClient.get.mockResolvedValue(oldAccessSession);
            mockRedisClient.set.mockResolvedValue('OK');

            await SessionManager.validateSession('test-session');

            // Should extend TTL since outside activity window
            expect(mockRedisClient.set).toHaveBeenCalledWith(
                'session:test-session',
                expect.any(Object),
                ONE_MONTH_IN_SECONDS
            );
        });

        it('should throw InfrastructureError when Redis fails', async () => {
            mockRedisClient.get.mockRejectedValue(
                new Error('Redis connection failed')
            );

            await expect(
                SessionManager.validateSession('test-session')
            ).rejects.toThrow(InfrastructureError);
        });

        it('should handle sessions with missing fields gracefully', async () => {
            const partialSession = {
                sessionId: 'partial',
                userId: 1
            };
            mockRedisClient.get.mockResolvedValue(partialSession);

            const result = await SessionManager.validateSession('partial');

            expect(result).toBeTruthy();
        });
    });

    //~=========================================================================================~//
    //$                                   INVALIDATE SESSION                                    $//
    //~=========================================================================================~//

    describe('invalidateSession', () => {
        it('should successfully remove session from Redis', async () => {
            const mockSession = createMockSession({ userId: 1 });
            const userSessions = ['test-session'];
            mockRedisClient.get
                .mockResolvedValueOnce(mockSession) // First call for session
                .mockResolvedValueOnce(userSessions); // Second call for user sessions
            mockRedisClient.set.mockResolvedValue('OK');
            mockRedisClient.del.mockResolvedValue(1);

            await SessionManager.invalidateSession('test-session');

            expect(mockRedisClient.del).toHaveBeenCalledWith(
                'session:test-session'
            );
        });

        it('should remove session ID from user session set', async () => {
            const mockSession = createMockSession({ userId: 1 });
            const userSessions = ['test-session', 'other-session'];

            mockRedisClient.get
                .mockResolvedValueOnce(mockSession) // First call for session
                .mockResolvedValueOnce(userSessions); // Second call for user sessions
            mockRedisClient.set.mockResolvedValue('OK');
            mockRedisClient.del.mockResolvedValue(1);

            await SessionManager.invalidateSession('test-session');

            expect(mockRedisClient.set).toHaveBeenCalledWith(
                'user_sessions:1',
                ['other-session'],
                ONE_MONTH_IN_SECONDS
            );
        });

        it('should handle non-existent session gracefully', async () => {
            mockRedisClient.get.mockResolvedValue(null);
            mockRedisClient.del.mockResolvedValue(0);

            await expect(
                SessionManager.invalidateSession('non-existent')
            ).resolves.not.toThrow();
        });

        it('should cleanup user session set when last session removed', async () => {
            const mockSession = createMockSession({ userId: 1 });
            const userSessions = ['test-session']; // Only one session

            mockRedisClient.get
                .mockResolvedValueOnce(mockSession)
                .mockResolvedValueOnce(userSessions);
            mockRedisClient.del.mockResolvedValue(1);

            await SessionManager.invalidateSession('test-session');

            expect(mockRedisClient.del).toHaveBeenCalledWith('user_sessions:1');
        });

        it('should handle empty session ID gracefully', async () => {
            await expect(
                SessionManager.invalidateSession('')
            ).resolves.not.toThrow();

            expect(mockRedisClient.del).not.toHaveBeenCalled();
        });

        it('should throw InfrastructureError on Redis failure', async () => {
            const mockSession = createMockSession();
            mockRedisClient.get.mockResolvedValue(mockSession);
            mockRedisClient.del.mockRejectedValue(new Error('Redis error'));

            await expect(
                SessionManager.invalidateSession('test-session')
            ).rejects.toThrow(InfrastructureError);
        });
    });

    //~=========================================================================================~//
    //$                                INVALIDATE ALL USER SESSIONS                             $//
    //~=========================================================================================~//

    describe('invalidateAllUserSessions', () => {
        it('should remove all sessions for a user', async () => {
            const userSessions = ['session-1', 'session-2', 'session-3'];
            mockRedisClient.get.mockResolvedValue(userSessions);
            mockRedisClient.del.mockResolvedValue(1);

            await SessionManager.invalidateAllUserSessions(1);

            expect(mockRedisClient.del).toHaveBeenCalledWith(
                'session:session-1'
            );
            expect(mockRedisClient.del).toHaveBeenCalledWith(
                'session:session-2'
            );
            expect(mockRedisClient.del).toHaveBeenCalledWith(
                'session:session-3'
            );

            expect(mockRedisClient.del).toHaveBeenCalledWith('user_sessions:1');
        });

        it('should cleanup all Redis keys properly', async () => {
            const userSessions = ['session-1', 'session-2'];
            mockRedisClient.get.mockResolvedValue(userSessions);
            mockRedisClient.del.mockResolvedValue(1);

            await SessionManager.invalidateAllUserSessions(42);

            expect(mockRedisClient.del).toHaveBeenCalledTimes(3);
        });

        it('should handle users with no sessions', async () => {
            mockRedisClient.get.mockResolvedValue(null);
            mockRedisClient.del.mockResolvedValue(0);

            await expect(
                SessionManager.invalidateAllUserSessions(1)
            ).resolves.not.toThrow();

            expect(mockRedisClient.del).not.toHaveBeenCalled();
        });

        it('should handle empty session array', async () => {
            mockRedisClient.get.mockResolvedValue([]);
            mockRedisClient.del.mockResolvedValue(0);

            await SessionManager.invalidateAllUserSessions(1);

            expect(mockRedisClient.del).not.toHaveBeenCalled();
        });
    });

    //~=========================================================================================~//
    //$                                    GET USER SESSIONS                                    $//
    //~=========================================================================================~//

    describe('getUserSessions', () => {
        it('should return all active sessions for user', async () => {
            const sessionIds = ['session-1', 'session-2'];
            const session1 = createMockSession({
                sessionId: 'session-1',
                userId: 1
            });
            const session2 = createMockSession({
                sessionId: 'session-2',
                userId: 1
            });

            mockRedisClient.get
                .mockResolvedValueOnce(sessionIds)
                .mockResolvedValueOnce(session1)
                .mockResolvedValueOnce(session2);

            const result = await SessionManager.getUserSessions(1);

            expect(result).toHaveLength(2);
            expect(result[0].sessionId).toBe('session-1');
            expect(result[1].sessionId).toBe('session-2');
        });

        it('should filter out expired sessions', async () => {
            const sessionIds = ['valid-session', 'expired-session'];
            const validSession = createMockSession({
                sessionId: 'valid-session',
                expiresAt: futureDate(10)
            });
            const expiredSession = createMockSession({
                sessionId: 'expired-session',
                expiresAt: pastDate(1)
            });

            mockRedisClient.get
                .mockResolvedValueOnce(sessionIds)
                .mockResolvedValueOnce(validSession)
                .mockResolvedValueOnce(expiredSession);
            mockRedisClient.set.mockResolvedValue('OK');

            const result = await SessionManager.getUserSessions(1);

            expect(result).toHaveLength(1);
            expect(result[0].sessionId).toBe('valid-session');
        });

        it('should return empty array for users with no sessions', async () => {
            mockRedisClient.get.mockResolvedValue([]);

            const result = await SessionManager.getUserSessions(1);

            expect(result).toEqual([]);
        });

        it('should handle null session list', async () => {
            mockRedisClient.get.mockResolvedValue(null);

            const result = await SessionManager.getUserSessions(1);

            expect(result).toEqual([]);
        });

        it('should handle sessions that no longer exist in Redis', async () => {
            const sessionIds = ['session-1', 'session-2', 'session-3'];
            const session1 = createMockSession({ sessionId: 'session-1' });

            mockRedisClient.get
                .mockResolvedValueOnce(sessionIds)
                .mockResolvedValueOnce(session1)
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(null);

            const result = await SessionManager.getUserSessions(1);

            expect(result).toHaveLength(1);
            expect(result[0].sessionId).toBe('session-1');
        });

        it('should cleanup stale session IDs from user sessions set', async () => {
            const sessionIds = ['valid-session', 'stale-session'];
            const validSession = createMockSession({
                sessionId: 'valid-session'
            });

            mockRedisClient.get
                .mockResolvedValueOnce(sessionIds)
                .mockResolvedValueOnce(validSession)
                .mockResolvedValueOnce(null); // stale session
            mockRedisClient.set.mockResolvedValue('OK');

            await SessionManager.getUserSessions(1);

            expect(mockRedisClient.set).toHaveBeenCalledWith(
                'user_sessions:1',
                ['valid-session'],
                ONE_MONTH_IN_SECONDS
            );
        });
    });
});
