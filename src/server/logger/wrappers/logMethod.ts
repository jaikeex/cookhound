import { Logger } from '@/server/logger';
import type { LogLevel } from '@/server/logger/types';

export interface LogOptions {
    attempt?: LogLevel;
    success?: LogLevel;
    names?: string[];
}

/**
 * Overloads:
 *  - @Log()                               -> attempt=trace, success=trace
 *  - @Log('trace', 'notice')              -> positional log levels
 *  - @Log({ names:['userId','recipeId']}) -> options object
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

    const successLevel: LogLevel =
        typeof arg1 === 'string'
            ? (arg2 ?? 'trace')
            : (arg1?.success ?? 'trace');

    const names: string[] =
        typeof arg1 === 'object' && !Array.isArray(arg1)
            ? (arg1.names ?? [])
            : [];

    return (
        _target: object,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<any>
    ): void | TypedPropertyDescriptor<any> => {
        const original = descriptor.value;

        if (typeof original !== 'function') return descriptor;

        descriptor.value = async function (...args: unknown[]) {
            const log = Logger.getInstance('user-service');

            const payload = names.length
                ? Object.fromEntries(names.map((n, i) => [n, args[i]]))
                : { args };

            (log as any)[attemptLevel](
                `${String(propertyKey)} - attempt`,
                payload
            );

            const result = await original.apply(this, args);

            (log as any)[successLevel](`${String(propertyKey)} - success`);

            return result;
        };

        return descriptor;
    };
}
