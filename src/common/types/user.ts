import type { Locale } from '@/common/types';

export type UserForCreatePayload = {
    username: string;
    email: string;
    password: string;
    termsAccepted: boolean;
};

export type UserForGoogleCreatePayload = {
    email: string;
    username: string;
    avatarUrl: string;
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
    locale?: Locale;
};

export enum UserRole {
    Guest = 'guest',
    User = 'user',
    Admin = 'admin'
}

export enum Status {
    Active = 'active',
    PendingDeletion = 'pending_deletion'
}

export enum AuthType {
    Local = 'local',
    Google = 'google'
}
