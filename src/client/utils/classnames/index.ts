// types inspired by the original `classnames` package
type ClassValue =
    | ClassArray
    | ClassDictionary
    | string
    | number
    | boolean
    | null
    | undefined;
interface ClassDictionary {
    [id: string]: any;
}
interface ClassArray extends Array<ClassValue> {}

/**
 * Build a space-separated list of unique class names.
 *
 * Supported inputs:
 *  • strings or numbers
 *  • arrays (including nested)
 *  • objects – a key is included when its value is truthy
 *
 * Falsy values (`undefined`, `null`, `false`, empty strings) are ignored.
 */
export default function classNames(...args: ClassValue[]): string {
    const result: string[] = [];
    const seen = new Set<string>();

    const add = (cls: string) => {
        if (!cls) return; // skip empty strings
        if (!seen.has(cls)) {
            seen.add(cls);
            result.push(cls);
        }
    };

    const process = (value: ClassValue): void => {
        if (value === null || value === undefined) return;

        if (typeof value === 'boolean') {
            return;
        }

        if (typeof value === 'string' || typeof value === 'number') {
            // Split on whitespace to dedupe individual tokens
            const tokens = String(value).trim().split(/\s+/);
            for (const token of tokens) add(token);
            return;
        }

        if (Array.isArray(value)) {
            for (const val of value) process(val);
            return;
        }

        if (typeof value === 'object') {
            for (const key in value as ClassDictionary) {
                if (
                    Object.prototype.hasOwnProperty.call(
                        value as ClassDictionary,
                        key
                    ) &&
                    (value as ClassDictionary)[key]
                ) {
                    add(key);
                }
            }
        }
    };

    for (const arg of args) {
        process(arg);
    }

    return result.join(' ');
}

export { classNames };
