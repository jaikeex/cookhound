import { vi } from 'vitest';

/**
 * Build a fully-typed but empty repository whose every accessed method is a
 * fresh vi.fn(). Useful when a test only calls one domain but
 * Repositories requires every slot to be populated, pass this for the
 * unrelated slots instead of hand-listing every port method.`.
 */
export const buildEmptyRepository = <T extends object>(): T =>
    new Proxy({} as T, {
        get: (target, prop) => {
            const key = prop as keyof T;
            if (!(key in target)) {
                (target as Record<PropertyKey, unknown>)[key as PropertyKey] =
                    vi.fn();
            }
            return target[key];
        }
    });
