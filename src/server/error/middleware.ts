import type { NextResponse } from 'next/server';

export class MiddlewareError extends Error {
    response: NextResponse;

    constructor(message: string, response: NextResponse) {
        super(message);
        this.name = 'MiddlewareError';
        this.response = response;
    }
}
