export type User = {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    status: Status;
    avatarUrl: string | null;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    lastLogin: string | null;
};

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

export enum UserRole {
    Guest = 'guest',
    User = 'user',
    Admin = 'admin'
}

export enum Status {
    Active = 'active'
}
