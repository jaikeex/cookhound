import type { Status, User, UserRole } from '@/common/types/user';
import type { UserForLogin, AuthResponse } from '@/common/types';
import prisma from '@/server/db/prisma';
import bcrypt from 'bcrypt';
import { HttpError } from '@/common/errors/HttpError';
import { createToken, verifyToken } from '@/server/utils/jwt';
import { cookies } from 'next/headers';

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
}

export const authService = new AuthService();
