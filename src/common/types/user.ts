export type UserForCreatePayload = {
    username: string;
    email: string;
    password: string;
};

export type UserForGoogleCreatePayload = {
    email: string;
    username: string;
    avatarUrl: string;
};

export type UserForLogin = {
    email: string;
    password: string;
    keepLoggedIn: boolean;
};

export type UserVisibilityGroup = 'public' | 'self' | 'admin';

export enum UserRole {
    Guest = 'guest',
    User = 'user',
    Admin = 'admin'
}

export enum Status {
    Active = 'active'
}

export enum AuthType {
    Local = 'local',
    Google = 'google'
}
