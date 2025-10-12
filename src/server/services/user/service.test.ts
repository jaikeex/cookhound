import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { userService } from './service';
import {
    validUser,
    unverifiedUser,
    googleUser,
    userWithPasswordResetToken,
    userWithExpiredPasswordResetToken,
    duplicateEmailUser,
    duplicateUsernameUser,
    TEST_PASSWORD,
    expectToThrowWithCode,
    setupPasswordMocks,
    setupUuidMock,
    setupRequestContextMocks
} from '@/server/utils/tests';
import {
    AuthErrorForbidden,
    ConflictError,
    NotFoundError,
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
            getOneByEmailOrUsername: vi.fn(),
            getOneById: vi.fn(),
            getOneByEmailVerificationToken: vi.fn(),
            getOneByPasswordResetToken: vi.fn(),
            createOne: vi.fn(),
            updateOneById: vi.fn(),
            getEmailChangeRequestByToken: vi.fn(),
            upsertEmailChangeRequest: vi.fn(),
            applyEmailChange: vi.fn(),
            markForDeletion: vi.fn(),
            cancelDeletion: vi.fn(),
            getUsersPendingHardDeletion: vi.fn(),
            executeHardDeletion: vi.fn(),
            createUserCookieConsent: vi.fn(),
            revokeUserCookieConsent: vi.fn(),
            getLatestUserCookieConsent: vi.fn(),
            createUserTermsAcceptance: vi.fn(),
            revokeUserTermsAcceptance: vi.fn(),
            getLatestUserTermsAcceptance: vi.fn(),
            upsertUserPreference: vi.fn()
        },
        accountDeletionRequest: {
            createOne: vi.fn(),
            getLatestByUserId: vi.fn(),
            markAsCancelled: vi.fn()
        }
    },
    getUserSelect: vi.fn(() => ({}))
}));

vi.mock('@/server/services/mail/service', () => ({
    mailService: {
        sendEmailVerification: vi.fn(),
        sendPasswordReset: vi.fn(),
        sendEmailChangeConfirmation: vi.fn(),
        sendEmailChangeNotice: vi.fn(),
        sendEmailChangedAudit: vi.fn(),
        sendAccountDeletionConfirmation: vi.fn(),
        sendAccountDeletionCancelled: vi.fn(),
        sendAccountDeleted: vi.fn()
    }
}));

vi.mock('@/server/utils/crypto', () => ({
    verifyPassword: vi.fn(),
    hashPassword: vi.fn()
}));

vi.mock('@/server/utils/reqwest/context', async () => {
    const { UserRole } = await import('@/common/types');
    return {
        RequestContext: {
            getIp: vi.fn(() => '127.0.0.1'),
            getUserAgent: vi.fn(() => 'Mozilla/5.0 Test Browser'),
            getUserId: vi.fn(() => 1),
            getUserRole: vi.fn(() => UserRole.User)
        }
    };
});

vi.mock('uuid', () => ({
    v4: vi.fn(() => 'mock-uuid-token')
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

import db from '@/server/db/model';
import { mailService } from '@/server/services/mail/service';
import { verifyPassword, hashPassword } from '@/server/utils/crypto';
import { RequestContext } from '@/server/utils/reqwest/context';
import { v4 as uuid } from 'uuid';

const mockDbUser = vi.mocked(db.user);
const mockMailService = vi.mocked(mailService);
const mockVerifyPassword = vi.mocked(verifyPassword);
const mockHashPassword = vi.mocked(hashPassword);
const mockRequestContext = vi.mocked(RequestContext);
const mockUuid = vi.mocked(uuid);

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('UserService', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup helpers for common mocks
        setupPasswordMocks(mockVerifyPassword, mockHashPassword);
        setupUuidMock(mockUuid, 'mock-uuid-token');
        setupRequestContextMocks(mockRequestContext, { userId: validUser.id });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    //~=========================================================================================~//
    //$                                       CREATE USER                                       $//
    //~=========================================================================================~//

    describe('createUser', () => {
        const newUserPayload = {
            email: 'newuser@example.com',
            password: TEST_PASSWORD,
            username: 'newuser',
            termsAccepted: true
        };

        it('should successfully create user with valid credentials', async () => {
            mockDbUser.getOneByEmailOrUsername.mockResolvedValue(null);
            mockDbUser.createOne.mockResolvedValue({
                ...validUser,
                email: newUserPayload.email,
                username: newUserPayload.username,
                emailVerified: false,
                emailVerificationToken: 'mock-uuid-token'
            });

            const result = await userService.createUser(newUserPayload);

            expect(result).toHaveProperty('email', newUserPayload.email);
            expect(result).toHaveProperty('username', newUserPayload.username);
            expect(mockDbUser.createOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: newUserPayload.email,
                    username: newUserPayload.username,
                    authType: 'local',
                    emailVerified: false,
                    emailVerificationToken: 'mock-uuid-token'
                })
            );
        });

        it('should generate email verification token', async () => {
            mockDbUser.getOneByEmailOrUsername.mockResolvedValue(null);
            mockDbUser.createOne.mockResolvedValue({
                ...validUser,
                email: newUserPayload.email,
                username: newUserPayload.username
            });

            await userService.createUser(newUserPayload);

            expect(mockUuid).toHaveBeenCalled();
            expect(mockDbUser.createOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    emailVerificationToken: 'mock-uuid-token'
                })
            );
        });

        it('should send verification email', async () => {
            mockDbUser.getOneByEmailOrUsername.mockResolvedValue(null);
            mockDbUser.createOne.mockResolvedValue({
                ...validUser,
                email: newUserPayload.email,
                username: newUserPayload.username
            });

            await userService.createUser(newUserPayload);

            expect(mockMailService.sendEmailVerification).toHaveBeenCalledWith(
                newUserPayload.email,
                newUserPayload.username,
                'mock-uuid-token'
            );
        });

        it('should throw ConflictError when email already taken', async () => {
            mockDbUser.getOneByEmailOrUsername.mockResolvedValue({
                ...duplicateEmailUser,
                email: newUserPayload.email
            });

            await expectToThrowWithCode(
                userService.createUser(newUserPayload),
                ConflictError,
                ApplicationErrorCode.CONFLICT,
                'auth.error.email-already-taken'
            );

            expect(mockDbUser.createOne).not.toHaveBeenCalled();
        });

        it('should throw ConflictError when username already taken', async () => {
            mockDbUser.getOneByEmailOrUsername.mockResolvedValue({
                ...duplicateUsernameUser,
                username: newUserPayload.username
            });

            await expectToThrowWithCode(
                userService.createUser(newUserPayload),
                ConflictError,
                ApplicationErrorCode.CONFLICT,
                'auth.error.username-already-taken'
            );

            expect(mockDbUser.createOne).not.toHaveBeenCalled();
        });
    });

    //~=========================================================================================~//
    //$                                  CREATE USER FROM GOOGLE                                $//
    //~=========================================================================================~//

    describe('createUserFromGoogle', () => {
        const googleUserPayload = {
            email: 'newgoogle@example.com',
            username: 'New Google User',
            avatarUrl: 'https://example.com/avatar.jpg'
        };

        it('should successfully create Google user', async () => {
            const newGoogleUser = {
                ...googleUser,
                id: 11,
                email: googleUserPayload.email,
                username: googleUserPayload.username,
                avatarUrl: googleUserPayload.avatarUrl
            };

            mockDbUser.getOneByEmail.mockResolvedValue(null);
            mockDbUser.createOne.mockResolvedValue(newGoogleUser);

            await userService.createUserFromGoogle(googleUserPayload);

            expect(mockDbUser.createOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: googleUserPayload.email,
                    username: googleUserPayload.username,
                    avatarUrl: googleUserPayload.avatarUrl
                })
            );
        });

        it('should set emailVerified to true', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(null);
            mockDbUser.createOne.mockResolvedValue({
                ...googleUser,
                email: googleUserPayload.email
            });

            await userService.createUserFromGoogle(googleUserPayload);

            expect(mockDbUser.createOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    emailVerified: true
                })
            );
        });

        it('should set authType to Google', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(null);
            mockDbUser.createOne.mockResolvedValue({
                ...googleUser,
                email: googleUserPayload.email
            });

            await userService.createUserFromGoogle(googleUserPayload);

            expect(mockDbUser.createOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    authType: 'google'
                })
            );
        });

        it('should throw ConflictError when email exists', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(validUser);

            await expectToThrowWithCode(
                userService.createUserFromGoogle(googleUserPayload),
                ConflictError,
                ApplicationErrorCode.USER_ALREADY_EXISTS,
                'auth.error.user-already-exists'
            );

            expect(mockDbUser.createOne).not.toHaveBeenCalled();
        });
    });

    //~=========================================================================================~//
    //$                                      GET USER BY ID                                     $//
    //~=========================================================================================~//

    describe('getUserById', () => {
        it('should successfully return user by ID', async () => {
            mockDbUser.getOneById.mockResolvedValue(validUser);

            const result = await userService.getUserById(validUser.id);

            expect(result).toHaveProperty('id', validUser.id);
            expect(result).toHaveProperty('email', validUser.email);
            expect(result).toHaveProperty('username', validUser.username);
        });

        it('should throw NotFoundError when user not found', async () => {
            mockDbUser.getOneById.mockResolvedValue(null);

            await expectToThrowWithCode(
                userService.getUserById(999),
                NotFoundError,
                ApplicationErrorCode.USER_NOT_FOUND,
                'app.error.not-found'
            );
        });
    });

    //~=========================================================================================~//
    //$                                       VERIFY EMAIL                                      $//
    //~=========================================================================================~//

    describe('verifyEmail', () => {
        const verificationToken = 'verification-token-123';

        it('should successfully verify email with valid token', async () => {
            mockDbUser.getOneByEmailVerificationToken.mockResolvedValue(
                unverifiedUser
            );
            mockDbUser.updateOneById.mockResolvedValue({
                ...unverifiedUser,
                emailVerified: true
            });

            await userService.verifyEmail(verificationToken);

            expect(
                mockDbUser.getOneByEmailVerificationToken
            ).toHaveBeenCalledWith(verificationToken);
        });

        it('should update emailVerified to true and clear token', async () => {
            mockDbUser.getOneByEmailVerificationToken.mockResolvedValue(
                unverifiedUser
            );
            mockDbUser.updateOneById.mockResolvedValue({
                ...unverifiedUser,
                emailVerified: true
            });

            await userService.verifyEmail(verificationToken);

            expect(mockDbUser.updateOneById).toHaveBeenCalledWith(
                unverifiedUser.id,
                {
                    emailVerified: true,
                    emailVerificationToken: null
                }
            );
        });

        it('should throw ValidationError when token missing', async () => {
            await expectToThrowWithCode(
                userService.verifyEmail(''),
                ValidationError,
                ApplicationErrorCode.MISSING_FIELD,
                'auth.error.missing-token'
            );

            expect(
                mockDbUser.getOneByEmailVerificationToken
            ).not.toHaveBeenCalled();
        });

        it('should throw NotFoundError when user not found', async () => {
            mockDbUser.getOneByEmailVerificationToken.mockResolvedValue(null);

            await expectToThrowWithCode(
                userService.verifyEmail(verificationToken),
                NotFoundError,
                ApplicationErrorCode.USER_NOT_FOUND,
                'auth.error.user-not-found'
            );
        });
    });

    //~=========================================================================================~//
    //$                                 RESEND VERIFICATION EMAIL                               $//
    //~=========================================================================================~//

    describe('resendVerificationEmail', () => {
        it('should generate new verification token', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(unverifiedUser);
            mockDbUser.updateOneById.mockResolvedValue(unverifiedUser);

            await userService.resendVerificationEmail(unverifiedUser.email);

            expect(mockUuid).toHaveBeenCalled();
            expect(mockDbUser.updateOneById).toHaveBeenCalledWith(
                unverifiedUser.id,
                {
                    emailVerificationToken: 'mock-uuid-token'
                }
            );
        });

        it('should send verification email', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(unverifiedUser);
            mockDbUser.updateOneById.mockResolvedValue(unverifiedUser);

            await userService.resendVerificationEmail(unverifiedUser.email);

            expect(mockMailService.sendEmailVerification).toHaveBeenCalledWith(
                unverifiedUser.email,
                unverifiedUser.username,
                'mock-uuid-token'
            );
        });

        it('should throw ValidationError when email missing', async () => {
            await expectToThrowWithCode(
                userService.resendVerificationEmail(''),
                ValidationError,
                ApplicationErrorCode.MISSING_FIELD,
                'auth.error.email-required'
            );

            expect(mockDbUser.getOneByEmail).not.toHaveBeenCalled();
        });

        it('should throw NotFoundError when user not found', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(null);

            await expectToThrowWithCode(
                userService.resendVerificationEmail('nonexistent@example.com'),
                NotFoundError,
                ApplicationErrorCode.USER_NOT_FOUND,
                'auth.error.user-not-found'
            );
        });
    });

    //~=========================================================================================~//
    //$                                 SEND PASSWORD RESET EMAIL                               $//
    //~=========================================================================================~//

    describe('sendPasswordResetEmail', () => {
        it('should generate password reset token and expiry', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(validUser);
            mockDbUser.updateOneById.mockResolvedValue(validUser);

            await userService.sendPasswordResetEmail(validUser.email);

            expect(mockUuid).toHaveBeenCalled();
            expect(mockDbUser.updateOneById).toHaveBeenCalledWith(
                validUser.id,
                expect.objectContaining({
                    passwordResetToken: 'mock-uuid-token',
                    passwordResetTokenExpires: expect.any(Date)
                })
            );
        });

        it('should send password reset email', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(validUser);
            mockDbUser.updateOneById.mockResolvedValue(validUser);

            await userService.sendPasswordResetEmail(validUser.email);

            expect(mockMailService.sendPasswordReset).toHaveBeenCalledWith(
                validUser.email,
                validUser.username,
                'mock-uuid-token'
            );
        });

        it('should throw ValidationError when email missing', async () => {
            await expectToThrowWithCode(
                userService.sendPasswordResetEmail(''),
                ValidationError,
                ApplicationErrorCode.MISSING_FIELD,
                'auth.error.email-required'
            );

            expect(mockDbUser.getOneByEmail).not.toHaveBeenCalled();
        });

        it('should throw NotFoundError when user not found', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(null);

            await expectToThrowWithCode(
                userService.sendPasswordResetEmail('nonexistent@example.com'),
                NotFoundError,
                ApplicationErrorCode.USER_NOT_FOUND,
                'auth.error.user-not-found'
            );
        });

        it('should throw AuthErrorForbidden when email not verified', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(unverifiedUser);

            await expectToThrowWithCode(
                userService.sendPasswordResetEmail(unverifiedUser.email),
                AuthErrorForbidden,
                ApplicationErrorCode.EMAIL_NOT_VERIFIED,
                'auth.error.email-not-verified'
            );

            expect(mockDbUser.updateOneById).not.toHaveBeenCalled();
        });

        it('should throw AuthErrorForbidden for Google auth users', async () => {
            mockDbUser.getOneByEmail.mockResolvedValue(googleUser);

            await expectToThrowWithCode(
                userService.sendPasswordResetEmail(googleUser.email),
                AuthErrorForbidden,
                ApplicationErrorCode.GOOGLE_OAUTH_FAILED,
                'auth.error.google-auth-not-supported'
            );

            expect(mockDbUser.updateOneById).not.toHaveBeenCalled();
        });
    });

    //~=========================================================================================~//
    //$                                     RESET PASSWORD                                      $//
    //~=========================================================================================~//

    describe('resetPassword', () => {
        const newPassword = 'NewPassword123!';
        const resetToken = 'reset-token-123';

        it('should successfully reset password with valid token', async () => {
            mockDbUser.getOneByPasswordResetToken.mockResolvedValue(
                userWithPasswordResetToken
            );
            mockDbUser.updateOneById.mockResolvedValue(
                userWithPasswordResetToken
            );

            await userService.resetPassword(resetToken, newPassword);

            expect(mockDbUser.getOneByPasswordResetToken).toHaveBeenCalledWith(
                resetToken
            );
        });

        it('should hash new password', async () => {
            mockDbUser.getOneByPasswordResetToken.mockResolvedValue(
                userWithPasswordResetToken
            );
            mockDbUser.updateOneById.mockResolvedValue(
                userWithPasswordResetToken
            );

            await userService.resetPassword(resetToken, newPassword);

            expect(mockHashPassword).toHaveBeenCalledWith(newPassword);
        });

        it('should clear reset token and update lastPasswordReset', async () => {
            mockDbUser.getOneByPasswordResetToken.mockResolvedValue(
                userWithPasswordResetToken
            );
            mockDbUser.updateOneById.mockResolvedValue(
                userWithPasswordResetToken
            );

            await userService.resetPassword(resetToken, newPassword);

            expect(mockDbUser.updateOneById).toHaveBeenCalledWith(
                userWithPasswordResetToken.id,
                expect.objectContaining({
                    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$mock-hash',
                    passwordResetToken: null,
                    passwordResetTokenExpires: null,
                    lastPasswordReset: expect.any(Date)
                })
            );
        });

        it('should throw ValidationError when token or password missing', async () => {
            await expect(
                userService.resetPassword('', newPassword)
            ).rejects.toThrow(ValidationError);

            await expect(
                userService.resetPassword(resetToken, '')
            ).rejects.toThrow(ValidationError);

            await expectToThrowWithCode(
                userService.resetPassword('', newPassword),
                ValidationError,
                ApplicationErrorCode.MISSING_FIELD
            );

            expect(
                mockDbUser.getOneByPasswordResetToken
            ).not.toHaveBeenCalled();
        });

        it('should throw NotFoundError when user not found', async () => {
            mockDbUser.getOneByPasswordResetToken.mockResolvedValue(null);

            await expectToThrowWithCode(
                userService.resetPassword(resetToken, newPassword),
                NotFoundError,
                ApplicationErrorCode.USER_NOT_FOUND,
                'auth.error.user-not-found'
            );
        });

        it('should throw ValidationError when token expired', async () => {
            mockDbUser.getOneByPasswordResetToken.mockResolvedValue(
                userWithExpiredPasswordResetToken
            );

            await expectToThrowWithCode(
                userService.resetPassword('expired-reset-token', newPassword),
                ValidationError,
                ApplicationErrorCode.PASSWORD_RESET_TOKEN_EXPIRED,
                'auth.error.password-reset-token-expired'
            );

            expect(mockDbUser.updateOneById).not.toHaveBeenCalled();
        });

        it('should throw ValidationError when password changed too recently', async () => {
            const recentDate = new Date(); // Very recent, within 24 hours
            mockDbUser.getOneByPasswordResetToken.mockResolvedValue({
                ...userWithPasswordResetToken,
                lastPasswordReset: recentDate
            });

            await expectToThrowWithCode(
                userService.resetPassword(resetToken, newPassword),
                ValidationError,
                ApplicationErrorCode.PRECONDITION_FAILED,
                'auth.error.password-changed-too-recently'
            );

            expect(mockDbUser.updateOneById).not.toHaveBeenCalled();
        });

        it('should throw AuthErrorForbidden for Google auth users', async () => {
            mockDbUser.getOneByPasswordResetToken.mockResolvedValue({
                ...googleUser,
                passwordResetToken: resetToken
            });

            await expectToThrowWithCode(
                userService.resetPassword(resetToken, newPassword),
                AuthErrorForbidden,
                ApplicationErrorCode.GOOGLE_OAUTH_FAILED,
                'auth.error.google-auth-not-supported'
            );

            expect(mockDbUser.updateOneById).not.toHaveBeenCalled();
        });
    });

    //~=========================================================================================~//
    //$                                  COOKIE CONSENT MANAGEMENT                              $//
    //~=========================================================================================~//

    describe('createUserCookieConsent', () => {
        const consentPayload = {
            consent: true,
            accepted: ['essential', 'analytics'] as any[],
            version: '2025-09-15',
            createdAt: new Date(),
            userIpAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0 Test Browser',
            proofHash: 'test-proof-hash'
        };

        const mockConsent = {
            id: 1,
            userId: 1,
            consent: true,
            accepted: ['essential', 'analytics'],
            version: '2025-09-15',
            userIpAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0 Test Browser',
            proofHash: 'test-proof-hash',
            createdAt: new Date(),
            revokedAt: null,
            updatedAt: new Date()
        };

        it('should successfully create new consent record', async () => {
            mockDbUser.getOneById.mockResolvedValue(validUser as any);
            mockDbUser.createUserCookieConsent.mockResolvedValue(
                mockConsent as any
            );

            const result = await userService.createUserCookieConsent(
                validUser.id,
                consentPayload
            );

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('consent', true);
            expect(mockDbUser.createUserCookieConsent).toHaveBeenCalledWith(
                validUser.id,
                consentPayload
            );
        });

        it('should capture IP address and user agent from payload', async () => {
            mockDbUser.getOneById.mockResolvedValue(validUser as any);
            mockDbUser.createUserCookieConsent.mockResolvedValue(
                mockConsent as any
            );

            await userService.createUserCookieConsent(
                validUser.id,
                consentPayload
            );

            expect(mockDbUser.createUserCookieConsent).toHaveBeenCalledWith(
                validUser.id,
                expect.objectContaining({
                    userIpAddress: '127.0.0.1',
                    userAgent: 'Mozilla/5.0 Test Browser'
                })
            );
        });

        it('should handle database errors properly', async () => {
            mockDbUser.getOneById.mockResolvedValue(validUser as any);
            mockDbUser.createUserCookieConsent.mockRejectedValue(
                new Error('Database error')
            );

            await expect(
                userService.createUserCookieConsent(
                    validUser.id,
                    consentPayload
                )
            ).rejects.toThrow('Database error');
        });

        it('should return proper DTO structure', async () => {
            mockDbUser.getOneById.mockResolvedValue(validUser as any);
            mockDbUser.createUserCookieConsent.mockResolvedValue(
                mockConsent as any
            );

            const result = await userService.createUserCookieConsent(
                validUser.id,
                consentPayload
            );

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('userId');
            expect(result).toHaveProperty('consent');
            expect(result).toHaveProperty('version');
            expect(result).toHaveProperty('userIpAddress');
            expect(result).toHaveProperty('userAgent');
            expect(result).toHaveProperty('createdAt');
            expect(result).toHaveProperty('updatedAt');
        });
    });
});
