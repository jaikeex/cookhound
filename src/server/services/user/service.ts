import prisma from '@/server/db/prisma';
import { Status, UserRole } from '@/common/types';
import { type User, type UserForCreate } from '@/common/types';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { mailService } from '@/server/services';
import { HttpError } from '@/common/errors/HttpError';
import { AuthType, type UserForLocalCreate } from './types';

class UserService {
    async createUser(payload: UserForCreate): Promise<User> {
        const { email, password, username } = payload;

        if (!email || !password || !username) {
            throw new HttpError(
                'Email, password, and username are required',
                400
            );
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }]
            }
        });

        const availability = {
            email: existingUser?.email !== email,
            username: existingUser?.username !== username
        };

        if (!availability.email) {
            throw new HttpError('Email is already taken', 400);
        }

        if (!availability.username) {
            throw new HttpError('Username is already taken', 400);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = uuid();

        const userForCreate: UserForLocalCreate = {
            email,
            passwordHash: hashedPassword,
            username,
            authType: AuthType.Local,
            role: UserRole.User,
            status: Status.Active,
            emailVerified: false,
            emailVerificationToken: verificationToken
        };

        const user = await prisma.user.create({
            data: userForCreate
        });

        await mailService.sendEmailVerification(
            user.email,
            user.username,
            verificationToken
        );

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

        return userResponse;
    }

    async verifyEmail(token: string): Promise<void> {
        if (!token) {
            throw new HttpError('Token is required', 400);
        }

        const user = await prisma.user.findFirst({
            where: {
                emailVerificationToken: token
            }
        });

        if (!user) {
            throw new HttpError('User not found', 404);
        }

        if (user.emailVerified) {
            throw new HttpError('Email already verified', 400);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerificationToken: null
            }
        });
    }

    async resendVerificationEmail(email: string): Promise<void> {
        if (!email) {
            throw new HttpError('Email is required', 400);
        }

        const user = await prisma.user.findFirst({
            where: { email }
        });

        if (!user) {
            throw new HttpError('User not found', 404);
        }

        if (user.emailVerified) {
            throw new HttpError('Email already verified', 400);
        }

        const verificationToken = uuid();

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerificationToken: verificationToken
            }
        });

        await mailService.sendEmailVerification(
            user.email,
            user.username,
            verificationToken
        );
    }
}

export const userService = new UserService();
