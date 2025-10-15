import { expect } from 'vitest';
import type { ApplicationErrorCode } from '@/server/error/codes';

//~=============================================================================================~//
//$                                     ASSERTION HELPERS                                       $//
//~=============================================================================================~//

export async function expectToThrowWithCode(
    promise: Promise<any>,
    errorClass: any,
    code: ApplicationErrorCode,
    message?: string
) {
    await expect(promise).rejects.toThrow(errorClass);

    if (message) {
        await expect(promise).rejects.toMatchObject({ code, message });
    } else {
        await expect(promise).rejects.toMatchObject({ code });
    }
}

export function expectNoSensitiveFields(dto: any) {
    expect(dto).not.toHaveProperty('passwordHash');
    expect(dto).not.toHaveProperty('emailVerificationToken');
    expect(dto).not.toHaveProperty('passwordResetToken');
    expect(dto).not.toHaveProperty('passwordResetTokenExpires');
    expect(dto).not.toHaveProperty('emailVerificationTokenExpires');
}

export function expectValidUserDTO(dto: any) {
    expect(dto).toHaveProperty('id');
    expect(dto).toHaveProperty('email');
    expect(dto).toHaveProperty('username');
    expect(dto).toHaveProperty('authType');
    expect(dto).toHaveProperty('createdAt');
    expectNoSensitiveFields(dto);
}

export function expectValidPublicUserDTO(dto: any) {
    expect(dto).toHaveProperty('id');
    expect(dto).toHaveProperty('username');
    expect(dto).toHaveProperty('avatarUrl');
    expectNoSensitiveFields(dto);

    // Public users should not see email or auth details
    expect(dto).not.toHaveProperty('email');
}

//~=============================================================================================~//
//$                                      MOCK HELPERS                                           $//
//~=============================================================================================~//

export function createBeforeEachCleanup(mocks: {
    clearMocks?: (() => void)[];
    defaultImplementations?: (() => void)[];
}) {
    return () => {
        // Clear all mocks
        if (mocks.clearMocks) {
            mocks.clearMocks.forEach((fn) => fn());
        }

        // Apply default mock implementations
        if (mocks.defaultImplementations) {
            mocks.defaultImplementations.forEach((fn) => fn());
        }
    };
}

export function setupRequestContextMocks(
    mockRequestContext: any,
    options: {
        userId?: number;
        userRole?: string;
        ip?: string;
        userAgent?: string;
    } = {}
) {
    const {
        userId = 1,
        userRole = 'user',
        ip = '127.0.0.1',
        userAgent = 'Mozilla/5.0 Test Browser'
    } = options;

    mockRequestContext.getIp.mockReturnValue(ip);
    mockRequestContext.getUserAgent.mockReturnValue(userAgent);
    mockRequestContext.getUserId.mockReturnValue(userId);
    mockRequestContext.getUserRole.mockReturnValue(userRole);
}

export function setupPasswordMocks(
    mockVerifyPassword: any,
    mockSafeVerifyPassword: any,
    mockHashPassword: any,
    mockNeedsRehash: any,
    options: {
        verifyResult?: boolean;
        hashResult?: string;
        safeVerifyResult?: boolean;
        needsRehashResult?: boolean;
    } = {}
) {
    const {
        verifyResult = true,
        hashResult = '$argon2id$v=19$m=65536,t=3,p=4$mock-hash',
        safeVerifyResult = true,
        needsRehashResult = false
    } = options;

    mockVerifyPassword.mockResolvedValue(verifyResult);
    mockSafeVerifyPassword.mockResolvedValue(safeVerifyResult);
    mockHashPassword.mockResolvedValue(hashResult);
    mockNeedsRehash.mockReturnValue(needsRehashResult);
}

export function setupUuidMock(mockUuid: any, token = 'mock-uuid-token') {
    mockUuid.mockReturnValue(token);
}

//~=============================================================================================~//
//$                                    TEST DATA BUILDERS                                       $//
//~=============================================================================================~//

export function futureDate(days = 30): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

export function pastDate(days = 30): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
}

export function recentDate(hours = 1): Date {
    const date = new Date();
    date.setHours(date.getHours() - hours);
    return date;
}

//~=============================================================================================~//
//$                                    UTILITY FUNCTIONS                                        $//
//~=============================================================================================~//

export function daysUntil(date: Date): number {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isInFuture(date: Date): boolean {
    return date.getTime() > Date.now();
}

export function isInPast(date: Date): boolean {
    return date.getTime() < Date.now();
}

export class MockCallTracker {
    private calls: Array<{ method: string; args: any[] }> = [];

    track(method: string, ...args: any[]) {
        this.calls.push({ method, args });
    }

    getCalls() {
        return this.calls;
    }

    getCallOrder() {
        return this.calls.map((call) => call.method);
    }

    wasCalledBefore(method1: string, method2: string): boolean {
        const index1 = this.calls.findIndex((call) => call.method === method1);
        const index2 = this.calls.findIndex((call) => call.method === method2);
        return index1 !== -1 && index2 !== -1 && index1 < index2;
    }

    reset() {
        this.calls = [];
    }
}

//~=============================================================================================~//
//$                                   MOCK DATA BUILDERS                                        $//
//~=============================================================================================~//

export function createMockRequest(
    options: {
        url?: string;
        method?: string;
        headers?: Record<string, string>;
    } = {}
) {
    const {
        url = 'http://localhost:3000/test',
        method = 'GET',
        headers = {}
    } = options;

    // Ensure we always have x-real-ip header as fallback if not provided
    const headersWithDefaults = {
        ...headers
    };
    if (
        !headersWithDefaults['x-real-ip'] &&
        !headersWithDefaults['x-forwarded-for'] &&
        !headersWithDefaults['cf-connecting-ip']
    ) {
        headersWithDefaults['x-real-ip'] = '127.0.0.1';
    }

    const mockHeaders = new Headers(headersWithDefaults);
    const mockUrl = new URL(url);

    return {
        url,
        method,
        headers: mockHeaders,
        nextUrl: mockUrl,
        ip: headers['x-real-ip'] || '127.0.0.1'
    };
}

export function createMockSession(
    options: {
        sessionId?: string;
        userId?: number;
        userRole?: any;
        status?: any;
        ipAddress?: string;
        userAgent?: string;
        loginMethod?: 'manual' | 'google';
        createdAt?: Date;
        lastAccessedAt?: Date;
        expiresAt?: Date;
    } = {}
) {
    const now = new Date();
    const future = futureDate(30);

    return {
        sessionId: options.sessionId || 'test-session-id',
        userId: options.userId || 1,
        userRole: options.userRole || 'user',
        status: options.status || 'active',
        ipAddress: options.ipAddress || '127.0.0.1',
        userAgent: options.userAgent || 'Mozilla/5.0 Test Browser',
        loginMethod: options.loginMethod || 'manual',
        createdAt: options.createdAt || now,
        lastAccessedAt: options.lastAccessedAt || now,
        expiresAt: options.expiresAt || future
    };
}

export function createMockConsent(
    options: {
        id?: number;
        userId?: number;
        consent?: boolean;
        accepted?: string[];
        version?: string;
        userIpAddress?: string;
        userAgent?: string;
        proofHash?: string;
        createdAt?: Date;
        revokedAt?: Date | null;
        updatedAt?: Date;
    } = {}
) {
    const now = new Date();

    return {
        id: options.id || 1,
        userId: options.userId || 1,
        consent: options.consent ?? true,
        accepted: options.accepted || ['essential', 'analytics'],
        version: options.version || '2025-09-15',
        userIpAddress: options.userIpAddress || '127.0.0.1',
        userAgent: options.userAgent || 'Mozilla/5.0 Test Browser',
        proofHash: options.proofHash || 'mock-proof-hash',
        createdAt: options.createdAt || now,
        revokedAt: options.revokedAt || null,
        updatedAt: options.updatedAt || now
    };
}

export function setupRedisMocks(
    mockRedis: any,
    options: {
        getResult?: any;
        setResult?: string;
        delResult?: number;
        keysResult?: string[];
    } = {}
) {
    const {
        getResult = null,
        setResult = 'OK',
        delResult = 1,
        keysResult = []
    } = options;

    mockRedis.get.mockResolvedValue(getResult);
    mockRedis.set.mockResolvedValue(setResult);
    mockRedis.del.mockResolvedValue(delResult);
    mockRedis.keys.mockResolvedValue(keysResult);
}
