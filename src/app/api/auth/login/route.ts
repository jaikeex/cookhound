import type { NextRequest } from 'next/server';
import { authService } from '@/server/services/auth/service';
import { serialize } from 'cookie';

export async function POST(request: NextRequest) {
    const { email, password, keepLoggedIn } = await request.json();

    const response = await authService.login({ email, password, keepLoggedIn });

    const cookie = serialize('token', response.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: keepLoggedIn ? 60 * 60 * 24 * 30 : undefined,
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
}
