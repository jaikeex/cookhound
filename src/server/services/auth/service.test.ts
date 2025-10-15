import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from './service';
import {
    validUser,
    unverifiedUser,
    googleUser,
    newGoogleUserDTO,
    TEST_PASSWORD,
    mockGoogleAccessTokenResponse,
    mockGoogleUserInfo,
    mockNewGoogleUserInfo,
    expectToThrowWithCode,
    expectNoSensitiveFields,
    setupPasswordMocks,
    setupRequestContextMocks
} from '@/server/utils/tests';
import {
    AuthErrorForbidden,
    AuthErrorUnauthorized,
    ValidationError
} from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';

//|=============================================================================================|//
//$                                           MOCKS                                             $//
//|=============================================================================================|//

//? vitest mocks need to be hoisted to the top, it throws otherwise

vi.mock('@/server/db/model', () => ({
    default: {
        user: {
            getOneByEmail: vi.fn(),
            getOneById: vi.fn(),
            updateOneById: vi.fn(),
            registerUserVisit: vi.fn()
        }
    },
    getUserSelect: vi.fn(() => ({}))
}));

vi.mock('@/server/utils/session', () => ({
    sessions: {
        createSession: vi.fn(),
        invalidateSession: vi.fn(),
        invalidateAllUserSessions: vi.fn()
    },
    deleteSessionCookie: vi.fn()
}));

vi.mock('@/server/utils/reqwest/context', async () => {
    const { UserRole } = await import('@/common/types');
    return {
        RequestContext: {
            getIp: vi.fn(() => '127.0.0.1'),
            getUserAgent: vi.fn(() => 'Mozilla/5.0 Test Browser'),
            getUserId: vi.fn(() => 1 as number | undefined),
            getUserRole: vi.fn(() => UserRole.User)
        }
    };
});

vi.mock('@/server/services/user/service', () => ({
    userService: {
        createUserFromGoogle: vi.fn()
    }
}));

vi.mock('@/server/utils/reqwest', () => ({
    assertAuthenticated: vi.fn(() => 1)
}));

vi.mock('@/server/utils/crypto', () => ({
    verifyPassword: vi.fn(),
    hashPassword: vi.fn()
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

import db from '@/server/db/model';
import { sessions, deleteSessionCookie } from '@/server/utils/session';
import { RequestContext } from '@/server/utils/reqwest/context';
import { userService } from '@/server/services/user/service';
import { assertAuthenticated } from '@/server/utils/reqwest';
import { verifyPassword, hashPassword } from '@/server/utils/crypto';

const mockDbUser = vi.mocked(db.user);
const mockSessions = vi.mocked(sessions);
const mockDeleteSessionCookie = vi.mocked(deleteSessionCookie);
const mockRequestContext = vi.mocked(RequestContext);
const mockUserService = vi.mocked(userService);
const mockAssertAuthenticated = vi.mocked(assertAuthenticated);
const mockVerifyPassword = vi.mocked(verifyPassword);
const mockHashPassword = vi.mocked(hashPassword);

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('AuthService', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockSessions.createSession.mockResolvedValue('mock-session-token');
        mockDbUser.updateOneById.mockResolvedValue(validUser);
        mockDbUser.registerUserVisit.mockResolvedValue(undefined);
        mockAssertAuthenticated.mockReturnValue(validUser.id);

        setupPasswordMocks(mockVerifyPassword, mockHashPassword);
        setupRequestContextMocks(mockRequestContext, {
            userId: validUser.id
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    //~=========================================================================================~//
    //$                                          LOGIN                                          $//
    //~=========================================================================================~//

    describe('login', () => {
        it('should successfully login with valid credentials', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(validUser);
            mockVerifyPassword.mockResolvedValue(true);

            const result = await authService.login({
                email: validUser.email,
                password: TEST_PASSWORD,
                keepLoggedIn: false
            });

            expect(result).toHaveProperty('token', 'mock-session-token');
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe(validUser.email);

            expect(mockVerifyPassword).toHaveBeenCalledWith(
                TEST_PASSWORD,
                validUser.passwordHash
            );
        });

        it('should create session with correct parameters', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(validUser);
            mockVerifyPassword.mockResolvedValue(true);

            await authService.login({
                email: validUser.email,
                password: TEST_PASSWORD,
                keepLoggedIn: false
            });

            expect(mockSessions.createSession).toHaveBeenCalledWith(
                validUser.id,
                {
                    ipAddress: '127.0.0.1',
                    userAgent: 'Mozilla/5.0 Test Browser',
                    userRole: validUser.role,
                    status: validUser.status,
                    loginMethod: 'manual'
                }
            );
        });

        it('should throw ValidationError when email is missing', async () => {
            await expectToThrowWithCode(
                authService.login({
                    email: '',
                    password: TEST_PASSWORD,
                    keepLoggedIn: false
                }),
                ValidationError,
                ApplicationErrorCode.MISSING_FIELD,
                'auth.error.email-required'
            );

            expect(mockDbUser.getOneByEmail).not.toHaveBeenCalled();
        });

        it('should throw ValidationError when password is missing', async () => {
            await expectToThrowWithCode(
                authService.login({
                    email: validUser.email,
                    password: '',
                    keepLoggedIn: false
                }),
                ValidationError,
                ApplicationErrorCode.MISSING_FIELD,
                'auth.error.password-required'
            );

            expect(mockDbUser.getOneByEmail).not.toHaveBeenCalled();
        });

        it('should throw AuthErrorUnauthorized when user not found', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(null);

            await expectToThrowWithCode(
                authService.login({
                    email: 'nonexistent@example.com',
                    password: TEST_PASSWORD,
                    keepLoggedIn: false
                }),
                AuthErrorUnauthorized,
                ApplicationErrorCode.INVALID_CREDENTIALS,
                'auth.error.invalid-credentials'
            );
        });

        it('should throw AuthErrorForbidden when email not verified', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(unverifiedUser);

            await expectToThrowWithCode(
                authService.login({
                    email: unverifiedUser.email,
                    password: TEST_PASSWORD,
                    keepLoggedIn: false
                }),
                AuthErrorForbidden,
                ApplicationErrorCode.EMAIL_NOT_VERIFIED,
                'auth.error.email-not-verified'
            );

            expect(mockVerifyPassword).not.toHaveBeenCalled();
        });

        it('should throw AuthErrorUnauthorized when password is invalid', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(validUser);
            mockVerifyPassword.mockResolvedValue(false);

            await expectToThrowWithCode(
                authService.login({
                    email: validUser.email,
                    password: 'WrongPassword123!',
                    keepLoggedIn: false
                }),
                AuthErrorUnauthorized,
                ApplicationErrorCode.INVALID_CREDENTIALS,
                'auth.error.invalid-credentials'
            );

            expect(mockDbUser.updateOneById).not.toHaveBeenCalled();
            expect(mockSessions.createSession).not.toHaveBeenCalled();
        });
    });

    //~=========================================================================================~//
    //$                                     LOGIN WITH GOOGLE                                   $//
    //~=========================================================================================~//

    describe('loginWithGoogle', () => {
        const mockCode = 'mock-google-auth-code';

        beforeEach(() => {
            mockFetch.mockImplementation((url: string) => {
                if (url.includes('oauth2.googleapis.com/token')) {
                    return Promise.resolve({
                        ok: true,
                        json: () =>
                            Promise.resolve(mockGoogleAccessTokenResponse)
                    });
                }

                if (url.includes('www.googleapis.com/oauth2/v3/userinfo')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockGoogleUserInfo)
                    });
                }

                return Promise.reject(new Error('Unknown URL'));
            });
        });

        it('should successfully login existing Google user', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(googleUser);
            mockRequestContext.getUserId.mockReturnValue(googleUser.id);

            const result = await authService.loginWithGoogle({
                code: mockCode
            });

            expect(result).toHaveProperty('token', 'mock-session-token');
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe(googleUser.email);
            expect(mockUserService.createUserFromGoogle).not.toHaveBeenCalled();
        });

        it('should create new user when email does not exist', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(null);
            mockUserService.createUserFromGoogle.mockResolvedValue(
                newGoogleUserDTO
            );

            mockFetch.mockImplementation((url: string) => {
                if (url.includes('oauth2.googleapis.com/token')) {
                    return Promise.resolve({
                        ok: true,
                        json: () =>
                            Promise.resolve(mockGoogleAccessTokenResponse)
                    });
                }
                if (url.includes('www.googleapis.com/oauth2/v3/userinfo')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockNewGoogleUserInfo)
                    });
                }
                return Promise.reject(new Error('Unknown URL'));
            });

            const result = await authService.loginWithGoogle({
                code: mockCode
            });

            expect(result).toHaveProperty('token', 'mock-session-token');
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe(newGoogleUserDTO.email);
            expect(mockUserService.createUserFromGoogle).toHaveBeenCalledWith({
                email: mockNewGoogleUserInfo.email,
                username: mockNewGoogleUserInfo.name,
                avatarUrl: mockNewGoogleUserInfo.picture
            });
        });

        it('should create session with correct parameters for Google login', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(googleUser);
            mockRequestContext.getUserId.mockReturnValue(googleUser.id);

            await authService.loginWithGoogle({
                code: mockCode
            });

            expect(mockSessions.createSession).toHaveBeenCalledWith(
                googleUser.id,
                expect.objectContaining({
                    ipAddress: '127.0.0.1',
                    userAgent: 'Mozilla/5.0 Test Browser',
                    loginMethod: 'google'
                })
            );
        });

        it('should throw ValidationError when code is missing', async () => {
            await expectToThrowWithCode(
                authService.loginWithGoogle({
                    code: ''
                }),
                ValidationError,
                ApplicationErrorCode.MISSING_FIELD,
                'auth.error.google-oauth-code-required'
            );

            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('should throw AuthErrorUnauthorized when user info request fails', async () => {
            mockFetch.mockImplementation((url: string) => {
                if (url.includes('oauth2.googleapis.com/token')) {
                    return Promise.resolve({
                        ok: true,
                        json: () =>
                            Promise.resolve(mockGoogleAccessTokenResponse)
                    });
                }
                if (url.includes('www.googleapis.com/oauth2/v3/userinfo')) {
                    return Promise.resolve({
                        ok: false,
                        status: 401
                    });
                }
                return Promise.reject(new Error('Unknown URL'));
            });

            await expectToThrowWithCode(
                authService.loginWithGoogle({
                    code: mockCode
                }),
                AuthErrorUnauthorized,
                ApplicationErrorCode.GOOGLE_OAUTH_FAILED,
                'auth.error.failed-to-get-user-info'
            );
        });

        it('should make correct requests to Google OAuth endpoints', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(googleUser);

            await authService.loginWithGoogle({
                code: mockCode
            });

            expect(mockFetch).toHaveBeenCalledTimes(2);

            const tokenCall = mockFetch.mock.calls[0];
            expect(tokenCall[0]).toContain('oauth2.googleapis.com/token');
            expect(tokenCall[1]).toMatchObject({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const userInfoCall = mockFetch.mock.calls[1];
            expect(userInfoCall[0]).toContain(
                'www.googleapis.com/oauth2/v3/userinfo'
            );
            expect(userInfoCall[1]).toMatchObject({
                headers: {
                    Authorization: `Bearer ${mockGoogleAccessTokenResponse.access_token}`
                }
            });
        });
    });

    //~=========================================================================================~//
    //$                                          LOGOUT                                         $//
    //~=========================================================================================~//

    describe('logout', () => {
        it('should successfully invalidate session', async () => {
            const sessionId = 'test-session-id';

            await authService.logout(sessionId);

            expect(mockSessions.invalidateSession).toHaveBeenCalledWith(
                sessionId
            );
        });

        it('should delete session cookie', async () => {
            const sessionId = 'test-session-id';

            await authService.logout(sessionId);

            expect(mockDeleteSessionCookie).toHaveBeenCalled();
        });

        it('should handle logout even if session is already invalid', async () => {
            const sessionId = 'invalid-session-id';
            mockSessions.invalidateSession.mockResolvedValue(undefined);

            await expect(
                authService.logout(sessionId)
            ).resolves.toBeUndefined();
        });
    });

    //~=========================================================================================~//
    //$                                    LOGOUT EVERYWHERE                                    $//
    //~=========================================================================================~//

    describe('logoutEverywhere', () => {
        it('should invalidate all user sessions', async () => {
            mockRequestContext.getUserId.mockReturnValue(validUser.id);

            await authService.logoutEverywhere();

            expect(mockSessions.invalidateAllUserSessions).toHaveBeenCalledWith(
                validUser.id
            );
        });

        it('should delete session cookie', async () => {
            mockRequestContext.getUserId.mockReturnValue(validUser.id);

            await authService.logoutEverywhere();

            expect(mockDeleteSessionCookie).toHaveBeenCalled();
        });

        it('should handle multiple sessions correctly', async () => {
            mockRequestContext.getUserId.mockReturnValue(validUser.id);
            mockSessions.invalidateAllUserSessions.mockResolvedValue(undefined);

            await authService.logoutEverywhere();

            expect(
                mockSessions.invalidateAllUserSessions
            ).toHaveBeenCalledTimes(1);
            expect(mockSessions.invalidateAllUserSessions).toHaveBeenCalledWith(
                validUser.id
            );
        });
    });

    //~=========================================================================================~//
    //$                                      GET CURRENT USER                                   $//
    //~=========================================================================================~//

    describe('getCurrentUser', () => {
        beforeEach(() => {
            mockAssertAuthenticated.mockReturnValue(validUser.id);
        });

        it('should return authenticated user data', async () => {
            mockDbUser.getOneById.mockResolvedValue(validUser);

            const result = await authService.getCurrentUser();

            expect(result).toHaveProperty('id', validUser.id);
            expect(result).toHaveProperty('email', validUser.email);
            expect(result).toHaveProperty('username', validUser.username);
        });

        it('should throw AuthErrorUnauthorized when user not found', async () => {
            mockDbUser.getOneById.mockResolvedValue(null);

            await expectToThrowWithCode(
                authService.getCurrentUser(),
                AuthErrorUnauthorized,
                ApplicationErrorCode.USER_NOT_FOUND,
                'auth.error.user-not-found'
            );
        });

        it('should invalidate sessions when user not found', async () => {
            mockDbUser.getOneById.mockResolvedValue(null);

            await expect(authService.getCurrentUser()).rejects.toThrow();

            expect(mockSessions.invalidateAllUserSessions).toHaveBeenCalledWith(
                validUser.id
            );
            expect(mockDeleteSessionCookie).toHaveBeenCalled();
        });

        it('should throw AuthErrorUnauthorized when email not verified', async () => {
            mockDbUser.getOneById.mockResolvedValue(unverifiedUser);
            mockAssertAuthenticated.mockReturnValue(unverifiedUser.id);

            await expectToThrowWithCode(
                authService.getCurrentUser(),
                AuthErrorUnauthorized,
                ApplicationErrorCode.EMAIL_NOT_VERIFIED,
                'auth.error.email-not-verified'
            );
        });

        it('should invalidate sessions when email not verified', async () => {
            mockDbUser.getOneById.mockResolvedValue(unverifiedUser);
            mockAssertAuthenticated.mockReturnValue(unverifiedUser.id);

            await expect(authService.getCurrentUser()).rejects.toThrow();

            expect(mockSessions.invalidateAllUserSessions).toHaveBeenCalledWith(
                unverifiedUser.id
            );
            expect(mockDeleteSessionCookie).toHaveBeenCalled();
        });

        it('should return DTO without sensitive fields', async () => {
            mockDbUser.getOneById.mockResolvedValue(validUser);

            const result = await authService.getCurrentUser();

            expectNoSensitiveFields(result);

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('username');
            expect(result).toHaveProperty('authType');
            expect(result).toHaveProperty('createdAt');

            expect(result).not.toHaveProperty('role');
            expect(result).not.toHaveProperty('status');
        });
    });
});
