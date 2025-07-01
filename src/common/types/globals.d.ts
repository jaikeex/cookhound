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

    // Utility type that extracts the resolved value of a promise returned by a FN.
    // If FN does not return a promise, the return type itself is used.
    type AwaitedReturn<Fn extends (...args: any[]) => any> =
        ReturnType<Fn> extends Promise<infer R> ? R : ReturnType<Fn>;
}

export {};
