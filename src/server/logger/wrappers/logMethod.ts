import { Logger } from '@/server/logger';
import type { LogLevel } from '@/server/logger/types';

export interface LogOptions {
    attempt?: LogLevel;
    success?: LogLevel;
    names?: string[];
    excludeArgs?: boolean;
    context?: string;
}

interface HasLogContext {
    LOG_CONTEXT?: string;
}

/**
 * Overloads:
 *  - @LogServiceMethod()                                      -> attempt=trace, success=trace
 *  - @LogServiceMethod('trace', 'notice')                     -> positional log levels
 *  - @LogServiceMethod({ names:['userId','recipeId']})        -> options object with named args
 *  - @LogServiceMethod({ excludeArgs: true })                 -> skip all argument logging
 */
export function LogServiceMethod(): MethodDecorator;
export function LogServiceMethod(
    attempt: LogLevel,
    success?: LogLevel
): MethodDecorator;
export function LogServiceMethod(options: LogOptions): MethodDecorator;
export function LogServiceMethod(
    arg1?: LogLevel | LogOptions,
    arg2?: LogLevel
): MethodDecorator {
    const attemptLevel: LogLevel =
        typeof arg1 === 'string' ? arg1 : (arg1?.attempt ?? 'trace');

    /**
     * This is (i thinkg) a clever way to do this. If arg1 is present as a string then the caller
     * is defining log levels directly as top level arguments. In that case use arg2 if exists.
     * If however, the arg1 is not a string (or not present at all), then either an object was passed or the
     * args are empty. Try to read from the config object or default to trace.
     * The check is similar in nature for other configs above and below.
     */
    const successLevel: LogLevel =
        typeof arg1 === 'string'
            ? (arg2 ?? 'trace')
            : (arg1?.success ?? 'trace');

    const names: string[] =
        typeof arg1 === 'object' && !Array.isArray(arg1)
            ? (arg1.names ?? [])
            : [];

    const excludeArgs: boolean =
        typeof arg1 === 'object' && !Array.isArray(arg1)
            ? (arg1.excludeArgs ?? false)
            : false;

    const explicitContext: string | undefined =
        typeof arg1 === 'object' && !Array.isArray(arg1)
            ? arg1.context
            : undefined;

    return (
        target: object,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<any>
    ): void | TypedPropertyDescriptor<any> => {
        const original = descriptor.value;

        if (typeof original !== 'function') return descriptor;

        descriptor.value = function (...args: unknown[]) {
            //?—————————————————————————————————————————————————————————————————————————————————?//
            //?                                 LOGGER CONTEXT                                  ?//
            ///
            //# There needs to be a way to explicitly declare the logger context.
            //# Previously, it was inferred from the caller's constructor name, but,
            //# as it turns out, the bundler changes class identifiers
            //# ("minifies" officially...), into an unrecongizable ones, often single letters.
            //#
            //# Also, Resolving the context at call time ensures the LOG_CONTEXT
            //# field to be assigned. With legacy decorators the ordering of
            //# static field initialization vs method-decorator application
            //# cannot be guaranteed.
            ///
            //?—————————————————————————————————————————————————————————————————————————————————?//

            const ctor = target.constructor as HasLogContext & {
                name: string;
            };

            const className = explicitContext ?? ctor.LOG_CONTEXT ?? ctor.name;

            const log = Logger.getInstance(className);

            let payload: Record<string, unknown> = {};

            if (!excludeArgs) {
                payload = names.length
                    ? Object.fromEntries(names.map((n, i) => [n, args[i]]))
                    : { args };
            }

            log[attemptLevel](`${String(propertyKey)} - attempt`, payload);

            const result = original.apply(this, args);

            // If the original method returns a promise, chain the success log onto it...
            // otherwise log synchronously and return the value unchanged.
            if (result instanceof Promise) {
                return result.then((value: unknown) => {
                    log[successLevel](`${String(propertyKey)} - success`);
                    return value;
                });
            }

            log[successLevel](`${String(propertyKey)} - success`);
            return result;
        };

        return descriptor;
    };
}
