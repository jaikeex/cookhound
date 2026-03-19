import type { ClientError } from '@/server/error';
import { RequestContext } from '@/server/utils/reqwest/context';
import { UserRole } from '@/common/types';
import { AuthErrorUnauthorized, AuthErrorForbidden } from '@/server/error';
import { deleteSessionCookie } from '@/server/utils/session';

/**
 * Asserts that the caller is anonymous (there is no userId present in the RequestContext).
 *
 * @param error - The error to throw if the caller is not anonymous.
 * @throws {AuthErrorUnauthorized} If the caller is not anonymous.
 */
export function assertAnonymous(error?: ClientError): void {
    if (RequestContext.getUserRole() !== UserRole.Guest) {
        throw error ?? new AuthErrorUnauthorized();
    }
}

/**
 * Asserts that the caller is authenticated (there is a userId present in the RequestContext).
 * Returns the authenticated user id for convenience.
 *
 * @param error - The error to throw if the caller is not authenticated.
 * @throws {AuthErrorUnauthorized} If the caller is anonymous.
 */
export function assertAuthenticated(error?: ClientError): number {
    const userId = RequestContext.getUserId();

    if (!userId) {
        deleteSessionCookie();
        throw error ?? new AuthErrorUnauthorized();
    }

    return userId;
}

/**
 * Asserts that the caller is operating on their own user resource.
 *
 * @param userId - The user id that is being accessed/modified.
 * @param error - The error to throw if the caller is not the same user.
 * @throws {AuthErrorUnauthorized} If the caller is not the same user.
 */
export function assertSelf(userId: number, error?: ClientError): void {
    if (RequestContext.getUserId() !== userId) {
        throw error ?? new AuthErrorUnauthorized();
    }
}

/**
 * Asserts that the caller is either the user themselves or has the Admin role.
 *
 * @param userId - The user id that is being accessed/modified.
 * @param error - The error to throw if the caller is neither the same user nor an admin.
 * @throws {AuthErrorUnauthorized} If the caller is neither the same user nor an admin.
 */
export function assertSelfOrAdmin(userId: number, error?: ClientError): void {
    const currentUserId = RequestContext.getUserId();
    const role = RequestContext.getUserRole();

    if (currentUserId !== userId && role !== UserRole.Admin) {
        throw error ?? new AuthErrorUnauthorized();
    }
}

/**
 * Asserts that the caller has the Admin role.
 * Returns the authenticated admin id for convenience.
 *
 * @param error - The error to throw if the caller is not an admin.
 * @throws {AuthErrorUnauthorized} If the caller is not authenticated.
 * @throws {AuthErrorForbidden} If the caller is authenticated but not an admin.
 */
export function assertAdmin(error?: ClientError): number {
    const userId = assertAuthenticated();
    const role = RequestContext.getUserRole();

    if (role !== UserRole.Admin) {
        throw error ?? new AuthErrorForbidden();
    }

    return userId;
}

/**
 * Asserts that the admin is not performing an action on themselves.
 * Returns the authenticated admin id for convenience.
 *
 * @param targetUserId - The target user id.
 * @throws {AuthErrorForbidden} If the admin is targeting themselves.
 */
export function assertAdminAndNotSelf(targetUserId: number): number {
    const adminUserId = assertAdmin();

    if (adminUserId === targetUserId) {
        throw new AuthErrorForbidden('admin.users.error.self-action');
    }

    return adminUserId;
}
