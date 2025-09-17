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

export function deepEquals(a: AnyObject, b: AnyObject): boolean {
    // Fast path for identical references and primitive equality (handles NaN correctly)
    if (Object.is(a, b)) {
        return true;
    }

    // Different types (including one being null) can never be equal at this point
    if (typeof a !== typeof b || a === null || b === null) {
        return false;
    }

    // Only objects, arrays or special built-ins reach this point

    // WeakMap cache to track already compared pairs – prevents infinite recursion on
    // circular structures and drastically reduces complexity for shared sub-graphs.
    const cache = new WeakMap<object, WeakSet<object>>();

    function equalsInternal(x: any, y: any): boolean {
        // Primitive & function reference equality (includes Symbol, bigint, undefined, etc.)
        if (Object.is(x, y)) {
            return true;
        }
        if (
            typeof x !== 'object' ||
            x === null ||
            typeof y !== 'object' ||
            y === null
        ) {
            return false;
        }

        // Handle cyclic references
        const cachedY = cache.get(x);
        if (cachedY) {
            if (cachedY.has(y)) {
                return true; // We have already proven x and y are equal earlier in the recursion tree
            }
        } else {
            cache.set(x, new WeakSet<object>());
        }
        cache.get(x)!.add(y);

        // Classes must have identical prototypes to be considered equal.
        if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) {
            return false;
        }

        // ----- Specialised built-ins -----
        // Date
        if (x instanceof Date) {
            return y instanceof Date && x.getTime() === y.getTime();
        }

        // RegExp
        if (x instanceof RegExp) {
            return (
                y instanceof RegExp &&
                x.source === y.source &&
                x.flags === y.flags &&
                x.lastIndex === y.lastIndex
            );
        }

        // ArrayBuffer & TypedArray (incl. DataView)
        if (ArrayBuffer.isView(x)) {
            if (!ArrayBuffer.isView(y) || x.constructor !== y.constructor) {
                return false;
            }
            const viewX = new Uint8Array(x.buffer, x.byteOffset, x.byteLength);
            const viewY = new Uint8Array(y.buffer, y.byteOffset, y.byteLength);
            if (viewX.length !== viewY.length) {
                return false;
            }
            for (let i = 0; i < viewX.length; i++) {
                if (viewX[i] !== viewY[i]) {
                    return false;
                }
            }
            return true;
        }
        if (x instanceof ArrayBuffer) {
            if (!(y instanceof ArrayBuffer) || x.byteLength !== y.byteLength) {
                return false;
            }
            const viewX = new Uint8Array(x);
            const viewY = new Uint8Array(y);
            for (let i = 0; i < viewX.length; i++) {
                if (viewX[i] !== viewY[i]) {
                    return false;
                }
            }
            return true;
        }

        // Map – order independent deep comparison
        if (x instanceof Map) {
            if (!(y instanceof Map) || x.size !== y.size) {
                return false;
            }
            for (const [k1, v1] of x) {
                let found = false;
                for (const [k2, v2] of y) {
                    if (equalsInternal(k1, k2)) {
                        if (!equalsInternal(v1, v2)) {
                            return false;
                        }
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return false;
                }
            }
            return true;
        }

        // Set – order independent deep comparison
        if (x instanceof Set) {
            if (!(y instanceof Set) || x.size !== y.size) {
                return false;
            }
            const unmatched = new Set(y);
            for (const v1 of x) {
                let found = false;
                for (const v2 of unmatched) {
                    if (equalsInternal(v1, v2)) {
                        unmatched.delete(v2);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return false;
                }
            }
            return unmatched.size === 0;
        }

        // Array (maintain order)
        if (Array.isArray(x)) {
            if (!Array.isArray(y) || x.length !== y.length) {
                return false;
            }
            for (let i = 0; i < x.length; i++) {
                if (!equalsInternal(x[i], y[i])) {
                    return false;
                }
            }
            return true;
        }

        // General object – compare own property keys (including symbols)
        const keysX = Reflect.ownKeys(x);
        const keysY = Reflect.ownKeys(y);
        if (keysX.length !== keysY.length) {
            return false;
        }

        // Property order is irrelevant – create a Set for quick existence check
        const keySet = new Set(keysY);
        for (const k of keysX) {
            if (!keySet.has(k)) {
                return false;
            }
        }

        // Deep compare property values
        for (const k of keysX) {
            if (!equalsInternal((x as any)[k], (y as any)[k])) {
                return false;
            }
        }

        return true;
    }

    return equalsInternal(a, b);
}
