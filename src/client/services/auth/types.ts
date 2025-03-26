export type UserForLogin = {
    email: string;
    password: string;
    keepLoggedIn: boolean;
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
