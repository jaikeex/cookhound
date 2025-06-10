import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    console.log('request', request);

    return Response.json({ message: 'Hello, world!' });
}
