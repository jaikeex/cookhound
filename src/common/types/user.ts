import type { CookieConsentDTO } from '@/common/types/cookie-consent';
import type { TermsAcceptanceDTO } from '@/common/types/terms-acceptance';

export type User = {
    id: number;
    username: string;
    avatarUrl: string | null;
    email?: string | null;
    cookieConsent?: CookieConsentDTO[] | null;
    termsAcceptance?: TermsAcceptanceDTO[] | null;
    preferences?: UserPreferences;
    role?: UserRole;
    status?: Status;
    authType?: AuthType;
    createdAt?: Date | null;
    lastLogin?: Date | null;
    lastVisitedAt?: Date | null;
    deletedAt?: Date | null;
    deletionScheduledFor?: Date | null;
};

export type UserForCreatePayload = {
    username: string;
    email: string;
    password: string;
    termsAccepted: boolean;
    captchaToken: string;
};

export type UserForGoogleCreatePayload = {
    email: string;
    username: string;
    avatarUrl: string;
    emailVerified: boolean;
};

export type UserForUpdatePayload = {
    username: string;
    avatarUrl: string;
};

export type UserForLogin = {
    email: string;
    password: string;
    keepLoggedIn: boolean;
};

export type AccountDeletionPayload = {
    password: string;
    reason?: string;
};

export type AccountDeletionResponse = {
    scheduledFor: string;
    daysRemaining: number;
};

export type UserVisibilityGroup = 'public' | 'self' | 'admin';

export type UserPreferences = {
    theme?: 'light' | 'dark' | 'system';
};

export enum UserRole {
    Guest = 'guest',
    User = 'user',
    Admin = 'admin'
}

export enum Status {
    Active = 'active',
    PendingDeletion = 'pending_deletion',
    Banned = 'banned'
}

export enum AuthType {
    Local = 'local',
    Google = 'google'
}
