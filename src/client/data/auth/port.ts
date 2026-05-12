import type { AuthCodePayload, User, UserForLogin } from '@/common/types';

/**
 * Domain port for authentication data access.
 */
export interface AuthRepository {
    getCurrentUser(args: { signal?: AbortSignal }): Promise<User>;

    login(data: UserForLogin): Promise<User>;

    loginWithGoogleOauth(data: AuthCodePayload): Promise<User>;

    logout(): Promise<void>;

    logoutAll(): Promise<void>;
}
