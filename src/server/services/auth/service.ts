import type { Status, User, UserRole } from '@/common/types/user';
import type {
    UserForLogin,
    AuthResponse,
    AuthCodePayload
} from '@/common/types';
import prisma from '@/server/db/prisma';
import bcrypt from 'bcrypt';
import { HttpError } from '@/common/errors/HttpError';
import { createToken, verifyToken } from '@/server/utils/jwt';
import { cookies } from 'next/headers';
import { ENV_CONFIG_PRIVATE, ENV_CONFIG_PUBLIC } from '@/common/constants';
import { userService } from '@/server/services/user/service';

class AuthService {
    async login(payload: UserForLogin): Promise<AuthResponse> {
        const { email, password } = payload;

        if (!email || !password) {
            throw new HttpError('Email and password are required', 400);
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.passwordHash) {
            throw new HttpError('Invalid credentials', 401);
        }

        if (!user.emailVerified) {
            throw new HttpError('Email not verified', 403);
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            throw new HttpError('Invalid credentials', 401);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        const token = createToken({
            id: user.id.toString(),
            role: user.role as UserRole
        });

        const userResponse: User = {
            id: user.id,
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            role: user.role as UserRole,
            status: user.status as Status,
            lastLogin: user.lastLogin?.toISOString() || null
        };

        return { token, user: userResponse };
    }

    async getCurrentUser(): Promise<User> {
        const cookieStore = await cookies();
        const token = cookieStore.get('jwt')?.value;

        if (!token) {
            throw new HttpError('Unauthorized', 401);
        }

        const decoded = verifyToken(token);

        const user = await prisma.user.findUnique({
            where: { id: Number(decoded.id) }
        });

        if (!user) {
            throw new HttpError('User not found', 404);
        }

        return {
            id: user.id,
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            role: user.role as UserRole,
            status: user.status as Status,
            lastLogin: user.lastLogin?.toISOString() || null
        };
    }

    async logout(): Promise<void> {
        const cookieStore = await cookies();
        cookieStore.delete('jwt');
        return;
    }

    async loginWithGoogleOauth(
        payload: AuthCodePayload
    ): Promise<AuthResponse> {
        const { code } = payload;

        const accessTokenParams = new URLSearchParams({
            code,
            client_id: ENV_CONFIG_PUBLIC.GOOGLE_OAUTH_CLIENT_ID,
            client_secret: ENV_CONFIG_PRIVATE.GOOGLE_OAUTH_CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: ENV_CONFIG_PRIVATE.GOOGLE_OAUTH_REDIRECT_URI,
            access_type: 'offline',
            approval_prompt: 'force'
        });

        const accessTokenResponse = await fetch(
            `https://oauth2.googleapis.com/token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: accessTokenParams.toString()
            }
        );

        const accessTokenData = await accessTokenResponse.json();
        const accessToken = accessTokenData.access_token;

        const userInfoResponse = await fetch(
            `https://www.googleapis.com/oauth2/v3/userinfo`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        const userInfoData: UserFromGoogle = await userInfoResponse.json();

        const dbUser = await prisma.user.findUnique({
            where: { email: userInfoData.email }
        });

        let user: User;

        if (dbUser) {
            user = {
                id: dbUser.id,
                email: dbUser.email,
                username: dbUser.username,
                avatarUrl: dbUser.avatarUrl,
                emailVerified: dbUser.emailVerified,
                createdAt: dbUser.createdAt.toISOString(),
                updatedAt: dbUser.updatedAt.toISOString(),
                role: dbUser.role as UserRole,
                status: dbUser.status as Status,
                lastLogin: dbUser.lastLogin?.toISOString() ?? null
            };
        } else {
            user = await userService.createUserFromGoogle({
                email: userInfoData.email,
                username: userInfoData.name,
                avatarUrl: userInfoData.picture
            });
        }

        const token = createToken({
            id: user.id.toString(),
            role: user.role
        });

        return { token, user };
    }
}

export const authService = new AuthService();

type UserFromGoogle = {
    email: string;
    email_verified: boolean;
    family_name: string;
    given_name: string;
    name: string;
    picture: string;
    sub: string;
};
