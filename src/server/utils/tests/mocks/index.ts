import type { User } from '@/server/db/generated/prisma/client';
import type { UserDTO } from '@/common/types';
import mockUsers from './users.json';

//~=============================================================================================~//
//$                                            USERS                                            $//
//~=============================================================================================~//

export const TEST_PASSWORD = 'TestPassword123!';

/**
 * The JSON fixtures store dates as ISO strings; convert them back to Date
 * instances (or null) so the object satisfies the Prisma User type.
 */
function toDate(value: unknown): Date | null {
    return typeof value === 'string' || typeof value === 'number'
        ? new Date(value)
        : null;
}

function reviveUserDates(user: AnyObject): User {
    return {
        ...user,
        createdAt: toDate(user.createdAt),
        updatedAt: toDate(user.updatedAt),
        lastLogin: toDate(user.lastLogin),
        lastVisitedAt: toDate(user.lastVisitedAt),
        deletedAt: toDate(user.deletedAt),
        deletionScheduledFor: toDate(user.deletionScheduledFor),
        lastPasswordReset: toDate(user.lastPasswordReset),
        passwordResetTokenExpires: toDate(user.passwordResetTokenExpires),
        emailVerificationTokenExpires: toDate(
            user.emailVerificationTokenExpires
        )
    } as unknown as User;
}

export const validUser = reviveUserDates(mockUsers.validUser);
export const unverifiedUser = reviveUserDates(mockUsers.unverifiedUser);
export const googleUser = reviveUserDates(mockUsers.googleUser);
export const newGoogleUser = reviveUserDates(mockUsers.newGoogleUser);
export const userWithPasswordResetToken = reviveUserDates(
    mockUsers.userWithPasswordResetToken
);
export const userWithExpiredPasswordResetToken = reviveUserDates(
    mockUsers.userWithExpiredPasswordResetToken
);
export const userWithRecentPasswordReset = reviveUserDates(
    mockUsers.userWithRecentPasswordReset
);
export const userPendingDeletion = reviveUserDates(
    mockUsers.userPendingDeletion
);
export const duplicateEmailUser = reviveUserDates(mockUsers.duplicateEmailUser);
export const duplicateUsernameUser = reviveUserDates(
    mockUsers.duplicateUsernameUser
);

export const validUserDTO: UserDTO = {
    id: validUser.id,
    username: validUser.username,
    email: validUser.email,
    avatarUrl: validUser.avatarUrl,
    role: validUser.role as UserDTO['role'],
    status: validUser.status as UserDTO['status'],
    authType: validUser.authType as UserDTO['authType'],
    preferences: {},
    cookieConsent: null,
    termsAcceptance: null,
    createdAt: validUser.createdAt as unknown as string,
    lastLogin: validUser.lastLogin as unknown as string | null,
    lastVisitedAt: validUser.lastVisitedAt as unknown as string | null,
    deletedAt: null,
    deletionScheduledFor: null
};

export const googleUserDTO: UserDTO = {
    id: googleUser.id,
    username: googleUser.username,
    email: googleUser.email,
    avatarUrl: googleUser.avatarUrl,
    role: googleUser.role as UserDTO['role'],
    status: googleUser.status as UserDTO['status'],
    authType: googleUser.authType as UserDTO['authType'],
    preferences: {},
    cookieConsent: null,
    termsAcceptance: null,
    createdAt: googleUser.createdAt as unknown as string,
    lastLogin: googleUser.lastLogin as unknown as string | null,
    lastVisitedAt: googleUser.lastVisitedAt as unknown as string | null,
    deletedAt: null,
    deletionScheduledFor: null
};

export const newGoogleUserDTO: UserDTO = {
    id: newGoogleUser.id,
    username: newGoogleUser.username,
    email: newGoogleUser.email,
    avatarUrl: newGoogleUser.avatarUrl,
    role: newGoogleUser.role as UserDTO['role'],
    status: newGoogleUser.status as UserDTO['status'],
    authType: newGoogleUser.authType as UserDTO['authType'],
    preferences: {},
    cookieConsent: null,
    termsAcceptance: null,
    createdAt: newGoogleUser.createdAt as unknown as string,
    lastLogin: newGoogleUser.lastLogin as unknown as string | null,
    lastVisitedAt: newGoogleUser.lastVisitedAt as unknown as string | null,
    deletedAt: null,
    deletionScheduledFor: null
};

export const mockGoogleAccessTokenResponse = {
    access_token: 'mock-access-token-123',
    expires_in: 3600,
    token_type: 'Bearer',
    scope: 'openid profile email',
    refresh_token: 'mock-refresh-token'
};

export const mockGoogleUserInfo = {
    sub: 'google-user-id-123',
    email: 'google@example.com',
    email_verified: true,
    name: 'Google User',
    given_name: 'Google',
    family_name: 'User',
    picture: 'https://example.com/avatar.jpg'
};

export const mockNewGoogleUserInfo = {
    sub: 'google-user-id-456',
    email: 'newgoogle@example.com',
    email_verified: true,
    name: 'New Google User',
    given_name: 'New',
    family_name: 'User',
    picture: 'https://example.com/newavatar.jpg'
};

//~=============================================================================================~//
//$                                      EMAIL CHANGE REQUESTS                                  $//
//~=============================================================================================~//

export const mockEmailChangeRequest = {
    id: 1,
    userId: validUser.id,
    newEmail: 'newemail@example.com',
    token: 'email-change-token-123',
    expiresAt: new Date('2099-12-31T23:59:59.000Z'),
    createdAt: new Date('2025-01-01T00:00:00.000Z')
};

export const mockExpiredEmailChangeRequest = {
    id: 2,
    userId: validUser.id,
    newEmail: 'newemail2@example.com',
    token: 'expired-email-change-token',
    expiresAt: new Date('2020-01-01T00:00:00.000Z'),
    createdAt: new Date('2020-01-01T00:00:00.000Z')
};

//~=============================================================================================~//
//$                                    ACCOUNT DELETION REQUESTS                                $//
//~=============================================================================================~//

export const mockAccountDeletionRequest = {
    id: 1,
    userId: userPendingDeletion.id,
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 Test Browser',
    reason: 'Test deletion',
    proofHash: 'mock-proof-hash',
    userEmail: userPendingDeletion.email,
    userName: userPendingDeletion.username,
    cancelledAt: null,
    createdAt: new Date('2025-01-01T00:00:00.000Z')
};

//~=============================================================================================~//
//$                                           RECIPES                                           $//
//~=============================================================================================~//
