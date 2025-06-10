import type { UserRole } from '@/common/types';

export type UserForLocalCreate = {
    username: string;
    email: string;
    passwordHash: string;
    authType: AuthType;
    role: UserRole;
    status: string;
    emailVerified: boolean;
    emailVerificationToken: string;
};

export type UserForGoogleCreate = {
    username: string;
    email: string;
    auth_type: AuthType;
    role: UserRole;
    status: string;
    avatarUrl: string;
    emailVerified: boolean;
};

export enum AuthType {
    Local = 'local',
    Google = 'google'
}
