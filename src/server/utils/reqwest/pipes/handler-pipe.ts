export type Handler<T extends AnyFunction> = T;

// A middleware can wrap ANY handler signature and must preserve that signature.
export type Middleware = <T extends AnyFunction>(handler: T) => T;

/**
 * Composes middleware HOCs from left to right.
 * pipe(a, b, c)(handler) === a(b(c(handler)))
 */
export function pipe(...middlewares: Middleware[]) {
    return <T extends AnyFunction>(handler: T): T => {
        return middlewares.reduceRight<Handler<T>>(
            (acc, mw) => mw(acc),
            handler
        );
    };
}
