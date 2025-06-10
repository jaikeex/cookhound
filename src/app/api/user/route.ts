import { userService } from '@/server/services';
import type { NextRequest } from 'next/server';
import { HttpError } from '@/common/errors/HttpError';

export async function GET(request: NextRequest) {
    console.log('request', request);

    return Response.json({ message: 'Hello, world!' });
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    try {
        const user = await userService.createUser(body);
        return Response.json({ user });
    } catch (error: any) {
        if (error instanceof HttpError) {
            return Response.json(
                { error: error.message },
                { status: error.status }
            );
        }
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    console.log('request', request);

    return Response.json({ message: 'Hello, world!' });
}
