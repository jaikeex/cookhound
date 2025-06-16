import { NextResponse } from 'next/server';

export class MiddlewareError extends Error {
    callback: () => NextResponse;

    constructor(message: string, callback?: () => NextResponse) {
        super(message);
        this.name = 'MiddlewareError';
        this.callback = callback ?? (() => NextResponse.next());
    }
}
