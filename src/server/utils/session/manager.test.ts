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
    keys: vi.fn(),
    sadd: vi.fn(),
    srem: vi.fn(),
    smembers: vi.fn()
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
        mockRedisClient.sadd.mockResolvedValue(undefined);
        mockRedisClient.srem.mockResolvedValue(undefined);
        mockRedisClient.smembers.mockResolvedValue([]);

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

            const sessionId = await SessionManager.createSession(
                1,
                validOptions
            );

            expect(mockRedisClient.set).toHaveBeenCalledWith(
                `session:${sessionId}`,
                expect.any(Object),
                ONE_MONTH_IN_SECONDS
            );

            expect(mockRedisClient.sadd).toHaveBeenCalledWith(
                'user-sessions:1',
                sessionId,
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

        it('should add session to user sessions set atomically', async () => {
            mockRedisClient.set.mockResolvedValue('OK');

            const newSessionId = await SessionManager.createSession(
                1,
                validOptions
            );

            // sadd is atomic — no need to read existing sessions first
            expect(mockRedisClient.sadd).toHaveBeenCalledWith(
                'user-sessions:1',
                newSessionId,
                ONE_MONTH_IN_SECONDS
            );
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
            mockRedisClient.get.mockResolvedValueOnce(mockSession);
            mockRedisClient.del.mockResolvedValue(1);

            await SessionManager.invalidateSession('test-session');

            expect(mockRedisClient.del).toHaveBeenCalledWith(
                'session:test-session'
            );
        });

        it('should atomically remove session ID from user session set', async () => {
            const mockSession = createMockSession({ userId: 1 });
            mockRedisClient.get.mockResolvedValueOnce(mockSession);
            mockRedisClient.del.mockResolvedValue(1);

            await SessionManager.invalidateSession('test-session');

            expect(mockRedisClient.srem).toHaveBeenCalledWith(
                'user-sessions:1',
                'test-session'
            );
        });

        it('should handle non-existent session gracefully', async () => {
            mockRedisClient.get.mockResolvedValue(null);
            mockRedisClient.del.mockResolvedValue(0);

            await expect(
                SessionManager.invalidateSession('non-existent')
            ).resolves.not.toThrow();
        });

        it('should handle last session removal (Redis auto-deletes empty sets)', async () => {
            const mockSession = createMockSession({ userId: 1 });
            mockRedisClient.get.mockResolvedValueOnce(mockSession);
            mockRedisClient.del.mockResolvedValue(1);

            await SessionManager.invalidateSession('test-session');

            // srem is called; Redis automatically deletes the set key
            // when the last member is removed — no explicit del needed.
            expect(mockRedisClient.srem).toHaveBeenCalledWith(
                'user-sessions:1',
                'test-session'
            );
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
            mockRedisClient.smembers.mockResolvedValue(userSessions);
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

            expect(mockRedisClient.del).toHaveBeenCalledWith('user-sessions:1');
        });

        it('should cleanup all Redis keys properly', async () => {
            const userSessions = ['session-1', 'session-2'];
            mockRedisClient.smembers.mockResolvedValue(userSessions);
            mockRedisClient.del.mockResolvedValue(1);

            await SessionManager.invalidateAllUserSessions(42);

            expect(mockRedisClient.del).toHaveBeenCalledTimes(3);
        });

        it('should handle users with no sessions', async () => {
            mockRedisClient.smembers.mockResolvedValue([]);

            await expect(
                SessionManager.invalidateAllUserSessions(1)
            ).resolves.not.toThrow();

            expect(mockRedisClient.del).not.toHaveBeenCalled();
        });

        it('should handle empty session array', async () => {
            mockRedisClient.smembers.mockResolvedValue([]);

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

            mockRedisClient.smembers.mockResolvedValue(sessionIds);
            mockRedisClient.get
                .mockResolvedValueOnce(session1)
                .mockResolvedValueOnce(session2);

            const result = await SessionManager.getUserSessions(1);

            expect(result).toHaveLength(2);
            expect(result[0].sessionId).toBe('session-1');
            expect(result[1].sessionId).toBe('session-2');
        });

        it('should filter out expired sessions and remove them from set', async () => {
            const sessionIds = ['valid-session', 'expired-session'];
            const validSession = createMockSession({
                sessionId: 'valid-session',
                expiresAt: futureDate(10)
            });
            const expiredSession = createMockSession({
                sessionId: 'expired-session',
                expiresAt: pastDate(1)
            });

            mockRedisClient.smembers.mockResolvedValue(sessionIds);
            mockRedisClient.get
                .mockResolvedValueOnce(validSession)
                .mockResolvedValueOnce(expiredSession);

            const result = await SessionManager.getUserSessions(1);

            expect(result).toHaveLength(1);
            expect(result[0].sessionId).toBe('valid-session');
            expect(mockRedisClient.srem).toHaveBeenCalledWith(
                'user-sessions:1',
                'expired-session'
            );
        });

        it('should return empty array for users with no sessions', async () => {
            mockRedisClient.smembers.mockResolvedValue([]);

            const result = await SessionManager.getUserSessions(1);

            expect(result).toEqual([]);
        });

        it('should handle sessions that no longer exist in Redis', async () => {
            const sessionIds = ['session-1', 'session-2', 'session-3'];
            const session1 = createMockSession({ sessionId: 'session-1' });

            mockRedisClient.smembers.mockResolvedValue(sessionIds);
            mockRedisClient.get
                .mockResolvedValueOnce(session1)
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(null);

            const result = await SessionManager.getUserSessions(1);

            expect(result).toHaveLength(1);
            expect(result[0].sessionId).toBe('session-1');

            // Stale IDs should be removed from the set
            expect(mockRedisClient.srem).toHaveBeenCalledWith(
                'user-sessions:1',
                'session-2'
            );
            expect(mockRedisClient.srem).toHaveBeenCalledWith(
                'user-sessions:1',
                'session-3'
            );
        });

        it('should cleanup stale session IDs atomically via srem', async () => {
            const sessionIds = ['valid-session', 'stale-session'];
            const validSession = createMockSession({
                sessionId: 'valid-session'
            });

            mockRedisClient.smembers.mockResolvedValue(sessionIds);
            mockRedisClient.get
                .mockResolvedValueOnce(validSession)
                .mockResolvedValueOnce(null); // stale session

            await SessionManager.getUserSessions(1);

            expect(mockRedisClient.srem).toHaveBeenCalledWith(
                'user-sessions:1',
                'stale-session'
            );
            // Valid session should NOT be removed
            expect(mockRedisClient.srem).not.toHaveBeenCalledWith(
                'user-sessions:1',
                'valid-session'
            );
        });
    });
});
