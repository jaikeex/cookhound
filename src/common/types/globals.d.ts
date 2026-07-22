declare global {
    type AnyObject<T = unknown> = Record<string, T>;
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
    type AwaitedReturn<Fn extends AnyFunction> =
        ReturnType<Fn> extends Promise<infer R> ? R : ReturnType<Fn>;

    interface Window {
        // Google analytics stuff
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
        [key: `ga-disable-${string}`]: boolean | undefined;

        // Google recaptcha stuff
        grecaptcha?: {
            ready: (cb: () => void) => void;
            execute: (
                siteKey: string,
                opts: { action: string }
            ) => Promise<string>;
        };
    }
}

export {};
