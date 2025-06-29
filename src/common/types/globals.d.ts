declare global {
    type AnyObject<T = any> = Record<string, T>;
    type AnyFunction = (...args: any[]) => any;

    type MiddlewareStepFunction = (
        request: NextRequest
    ) => Promise<void | NextResponse<unknown>>;

    type ErrorResponse = {
        title: string;
        message: string;
        status: number;
        code: string;
        requestId: string;
        timestamp: string;
    };
}

export {};
