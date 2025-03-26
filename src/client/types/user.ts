export type User = {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    status: Status;
    avatar_url: string | null;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
    last_login: string | null;
};

export enum UserRole {
    Guest = 'guest',
    User = 'user',
    Admin = 'admin'
}

export enum Status {
    Active = 'active'
}
