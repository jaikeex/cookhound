export function deepClone<T>(value: T): T {
    // Prefer the native structuredClone if it exists – it is fast, battle-tested, and handles
    // circular references, Dates, RegExps, Maps, Sets, ArrayBuffers, etc.
    // Most modern browsers (Chrome 98+, Firefox 94+, Safari 15.4+) and Node.js 17+ support it.
    // See https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
    if (typeof (globalThis as any).structuredClone === 'function') {
        return (globalThis as any).structuredClone(value);
    }

    // ---------------------------------------------------------------------------
    // Polyfill implementation when structuredClone is not available.
    // ---------------------------------------------------------------------------
    // 1. Supports primitives, Arrays, plain Objects, Map, Set, Date, RegExp,
    //    ArrayBuffer & typed arrays. Functions are passed by reference (not cloned),
    //    which mirrors structuredClone behaviour.
    // 2. Handles circular references using a WeakMap cache.
    // 3. Not designed to clone DOM nodes or other host-specific objects.
    // ---------------------------------------------------------------------------

    const seen = new WeakMap<object, any>();

    // The helper is intentionally typed with `any` to avoid the generic
    // assignment issues that forced us to rely on `@ts-expect-error` comments.
    // We still return a value of the correct type at the top-level API.
    function cloneInternal(input: any): any {
        // Primitives (string, number, bigint, boolean, undefined, symbol, null)
        if (typeof input !== 'object' || input === null) {
            return input;
        }

        // Handle cached circular reference
        if (seen.has(input as object)) {
            return seen.get(input as object);
        }

        // Date
        if (input instanceof Date) {
            return new Date(input.getTime());
        }

        // RegExp
        if (input instanceof RegExp) {
            return new RegExp(input.source, input.flags);
        }

        // Array
        if (Array.isArray(input)) {
            // We need to register the array in advance to resolve self-referencing structures.
            const arr: unknown[] = [];
            seen.set(input, arr);
            input.forEach((item, idx) => {
                arr[idx] = cloneInternal(item);
            });
            return arr;
        }

        // Map
        if (input instanceof Map) {
            const map = new Map<any, any>();
            seen.set(input, map);
            input.forEach((v, k) => {
                map.set(cloneInternal(k), cloneInternal(v));
            });
            return map;
        }

        // Set
        if (input instanceof Set) {
            const set = new Set<any>();
            seen.set(input, set);
            input.forEach((v) => {
                set.add(cloneInternal(v));
            });
            return set;
        }

        // ArrayBuffer & TypedArrays
        if (ArrayBuffer.isView(input)) {
            // Typed arrays (e.g., Uint8Array)
            return new (input.constructor as any)(input as any);
        }
        if (input instanceof ArrayBuffer) {
            return input.slice(0);
        }

        // Plain Object (including objects with prototypes other than Object.prototype)
        const prototype = Object.getPrototypeOf(input);
        const obj = Object.create(prototype);
        seen.set(input, obj);

        // Copy own enumerable string & symbol keys
        for (const key of Reflect.ownKeys(input)) {
            obj[key] = cloneInternal((input as any)[key]);
        }

        return obj;
    }

    return cloneInternal(value);
}
