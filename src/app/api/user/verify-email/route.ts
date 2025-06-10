import { HttpError } from '@/common/errors/HttpError';
import { userService } from '@/server/services';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    console.log('request', request);

    return Response.json({ message: 'Hello, world!' });
}

export async function PUT(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
        return Response.json({ message: 'Token is required' }, { status: 400 });
    }

    try {
        await userService.verifyEmail(token);
    } catch (error: any) {
        if (error instanceof HttpError) {
            return Response.json(
                { error: error.message },
                { status: error.status }
            );
        }
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ message: 'Email verified successfully' });
}
