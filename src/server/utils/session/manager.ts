import type { UserRole, Status } from '@/common/types';
import { redisClient } from '@/server/integrations/redis';
import { randomUUID } from 'crypto';
import type { Logger as LoggerType } from '@/server/logger';
import { InfrastructureError, ValidationError } from '@/server/error';
import { InfrastructureErrorCode } from '@/server/error/codes';
import {
    ONE_HOUR_IN_SECONDS,
    ONE_MONTH_IN_SECONDS
} from '@/common/constants/time';

//~=============================================================================================~//
//$                                            TYPES                                            $//
//~=============================================================================================~//

export type ServerSession = {
    sessionId: string;
    userId: number;
    userRole: UserRole;
    status: Status;
    createdAt: Date;
    lastAccessedAt: Date;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    loginMethod: 'manual' | 'google';
};

type CreateSessionOptions = {
    userRole: UserRole;
    status: Status;
    ipAddress: string | null;
    userAgent: string | null;
    loginMethod: 'manual' | 'google';
};

const SESSION_KEY_PREFIX = 'session';
const USER_SESSIONS_KEY_PREFIX = 'user_sessions';

let logInstance: LoggerType | null = null;

//~=============================================================================================~//
//$                                           LOGGER                                            $//
//~=============================================================================================~//

/**
 *# This lazy load is necessary here because this code is needed to be called from request context.
 *# Due to circular dependency problems, nothing that imports logger statically can be imported into
 *# the context, for reasons i did not have time to fix yet (the logger uses info from the context
 *# to anotate the request logs). I plan to resolve this once I encouter it again, but for now
 *# this is the only module that needs it, so here it is...
 */
async function getLogger(): Promise<LoggerType> {
    if (logInstance) {
        return logInstance;
    }

    const { Logger } = await import('@/server/logger');
    logInstance = Logger.getInstance('session-manager');
    return logInstance;
}

//~=============================================================================================~//
//$                                            CLASS                                            $//
//~=============================================================================================~//

class SessionManager {
    private static readonly SESSION_TTL = ONE_MONTH_IN_SECONDS;

    /**
     * Determines what is considered a single "active" sitting of the user. Once this time passes,
     * any furter manipulations with the session will update the ttl accordingly.
     */
    private static readonly ACTIVITY_WINDOW = ONE_HOUR_IN_SECONDS; // 1 hour

    private getSessionKey(sessionId: string): string {
        return `${SESSION_KEY_PREFIX}:${sessionId}`;
    }

    private getUserSessionsKey(userId: number): string {
        return `${USER_SESSIONS_KEY_PREFIX}:${userId}`;
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                      CREATE SESSION                                     ?//
    //|-----------------------------------------------------------------------------------------|//

    /**
     * Creates a new server session for the given user and returns the session ID.
     */
    async createSession(
        userId: number,
        options: CreateSessionOptions
    ): Promise<string> {
        const { userRole, status, ipAddress, userAgent, loginMethod } = options;

        if (!userId || userId <= 0) {
            throw new ValidationError();
        }

        const sessionId = randomUUID();
        const now = new Date();
        const expiresAt = new Date(
            now.getTime() + SessionManager.SESSION_TTL * 1000
        );

        const session: ServerSession = {
            sessionId,
            userId,
            userRole,
            status,
            createdAt: now,
            lastAccessedAt: now,
            expiresAt,
            ipAddress,
            userAgent,
            loginMethod
        };

        try {
            await redisClient.set(
                this.getSessionKey(sessionId),
                session,
                SessionManager.SESSION_TTL
            );

            // Update users -> sessions mapping
            const userKey = this.getUserSessionsKey(userId);

            const existing = (await redisClient.get<string[]>(userKey)) || [];
            existing.push(sessionId);

            await redisClient.set(
                userKey,
                existing,
                SessionManager.SESSION_TTL
            );

            (await getLogger()).trace('createSession - success', {
                userId,
                sessionId
            });

            return sessionId;
        } catch (error: unknown) {
            (await getLogger()).error('createSession - error', error, {
                userId
            });

            throw new InfrastructureError(
                InfrastructureErrorCode.REDIS_COMMAND_FAILED,
                error
            );
        }
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                     VALIDATE SESSION                                    ?//
    //|-----------------------------------------------------------------------------------------|//

    /**
     * Validates the provided session ID and returns the stored session data.
     * If the session is expired or does not exist, null is returned instead.
     */
    async validateSession(sessionId: string): Promise<ServerSession | null> {
        if (!sessionId) {
            throw new ValidationError();
        }

        try {
            const sessionKey = this.getSessionKey(sessionId);
            const session = await redisClient.get<ServerSession>(sessionKey);

            if (!session) {
                return null;
            }

            const now = Date.now();
            const expiresAtMs = new Date(session.expiresAt).getTime();

            if (expiresAtMs <= now) {
                // Session expired – deport it to mexico
                await this.invalidateSession(sessionId);
                return null;
            }

            const lastAccessedMs = new Date(session.lastAccessedAt).getTime();

            // Refresh lastAccessedAt and TTL if activity window passed
            if (now - lastAccessedMs >= SessionManager.ACTIVITY_WINDOW * 1000) {
                session.lastAccessedAt = new Date();
                session.expiresAt = new Date(
                    session.lastAccessedAt.getTime() +
                        SessionManager.SESSION_TTL * 1000
                );

                await redisClient.set(
                    sessionKey,
                    session,
                    SessionManager.SESSION_TTL
                );
            }

            return session;
        } catch (error: unknown) {
            (await getLogger()).error('validateSession - error', error, {
                sessionId
            });

            throw new InfrastructureError(
                InfrastructureErrorCode.REDIS_COMMAND_FAILED,
                error
            );
        }
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                    INVALIDATE SESSION                                   ?//
    //|-----------------------------------------------------------------------------------------|//

    /**
     * Invalidates a single session by session ID.
     */
    async invalidateSession(sessionId: string): Promise<void> {
        if (!sessionId) return;

        try {
            const sessionKey = this.getSessionKey(sessionId);

            const session = await redisClient.get<ServerSession>(sessionKey);

            if (session) {
                const userKey = this.getUserSessionsKey(session.userId);

                const userSessions =
                    (await redisClient.get<string[]>(userKey)) || [];

                const updated = userSessions.filter((id) => id !== sessionId);

                if (updated.length === 0) {
                    await redisClient.del(userKey);
                } else {
                    await redisClient.set(
                        userKey,
                        updated,
                        SessionManager.SESSION_TTL
                    );
                }
            }

            await redisClient.del(sessionKey);

            (await getLogger()).trace('invalidateSession - success', {
                sessionId
            });
        } catch (error: unknown) {
            (await getLogger()).error('invalidateSession - error', error, {
                sessionId
            });

            throw new InfrastructureError(
                InfrastructureErrorCode.REDIS_COMMAND_FAILED,
                error
            );
        }
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                     GET ALL FOR USER                                    ?//
    //|-----------------------------------------------------------------------------------------|//

    /**
     * Retrieves all active sessions for the given user. Expired sessions are
     * automatically cleaned up.
     */
    async getUserSessions(userId: number): Promise<ServerSession[]> {
        try {
            const userKey = this.getUserSessionsKey(userId);
            const sessionIds = (await redisClient.get<string[]>(userKey)) || [];

            if (!sessionIds.length) return [];

            const sessions: ServerSession[] = [];
            const validSessionIds: string[] = [];

            /**
             *# Fetch sessions sequentially to limit Redis round-trips. In most cases users have < 3 active
             *# sessions so this is fine. If there is ever a requirement to handle more sessions effectively,
             *# switch this implementation to pipeline / mget
             */
            for (const id of sessionIds) {
                const sessionKey = this.getSessionKey(id);

                const session =
                    await redisClient.get<ServerSession>(sessionKey);

                if (
                    session &&
                    new Date(session.expiresAt).getTime() > Date.now()
                ) {
                    sessions.push(session);
                    validSessionIds.push(id);
                }
            }

            // Clean up stale IDs if necessary.
            if (validSessionIds.length !== sessionIds.length) {
                await redisClient.set(
                    userKey,
                    validSessionIds,
                    SessionManager.SESSION_TTL
                );
            }

            return sessions;
        } catch (error: unknown) {
            (await getLogger()).error('getUserSessions - error', error, {
                userId
            });

            throw new InfrastructureError(
                InfrastructureErrorCode.REDIS_COMMAND_FAILED,
                error
            );
        }
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                 INVALIDATE ALL FOR USER                                 ?//
    //|-----------------------------------------------------------------------------------------|//

    /**
     * Invalidates all sessions for the provided user ID.
     */
    async invalidateAllUserSessions(userId: number): Promise<void> {
        try {
            const userKey = this.getUserSessionsKey(userId);
            const sessionIds = (await redisClient.get<string[]>(userKey)) || [];

            if (!sessionIds.length) return;

            for (const id of sessionIds) {
                await redisClient.del(this.getSessionKey(id));
            }

            await redisClient.del(userKey);

            (await getLogger()).trace('invalidateAllUserSessions - success', {
                userId
            });
        } catch (error: unknown) {
            (await getLogger()).error(
                'invalidateAllUserSessions - error',
                error,
                { userId }
            );

            throw new InfrastructureError(
                InfrastructureErrorCode.REDIS_COMMAND_FAILED,
                error
            );
        }
    }
}

export const sessions = new SessionManager();
