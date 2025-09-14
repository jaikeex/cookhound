import 'reflect-metadata';
import { plainToInstance, instanceToPlain } from 'class-transformer';

/**
 * Serialises an arbitrary plain object to a DTO class and back to a cleaned plain object,
 * applying the given exposure groups.
 */
export function serializeToPlain<T>(
    cls: new () => T,
    data: unknown,
    groups: string[] = []
): T {
    const instance = plainToInstance(cls, data as object, {
        excludeExtraneousValues: true,
        groups
    });

    return instanceToPlain(instance, { groups }) as T;
}

export function serializeManyToPlain<T>(
    cls: new () => T,
    data: unknown[],
    groups: string[] = []
): T[] {
    return data.map((d) => serializeToPlain(cls, d, groups));
}
