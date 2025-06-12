import type { UserDTO } from './user';

export type AuthResponse = {
    token: string;
    user: UserDTO;
};

export type AuthCodePayload = {
    code: string;
};

export type ResetPasswordEmailPayload = {
    email: string;
};

export type ResetPasswordPayload = {
    token: string;
    password: string;
};
