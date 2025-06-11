import type { NextRequest } from 'next/server';
import { authService } from '@/server/services/auth/service';
import { serialize } from 'cookie';
import { HttpError } from '@/common/errors/HttpError';

export async function POST(request: NextRequest) {
    const { code } = await request.json();
    try {
        const response = await authService.loginWithGoogleOauth({ code });

        const cookie = serialize('jwt', response.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 30,
            path: '/'
        });

        return Response.json(
            { ...response.user },
            {
                headers: {
                    'Set-Cookie': cookie
                }
            }
        );
    } catch (error) {
        if (error instanceof HttpError) {
            return Response.json(
                { message: error.message },
                { status: error.status }
            );
        }
    }
}
