/**
 * Converts a rate-limit window in seconds to a
 * human-readable duration string.
 */
export function formatWindow(seconds: number): string {
    if (seconds >= 3600) {
        return `${seconds / 3600}h`;
    }

    if (seconds >= 60) {
        return `${seconds / 60}m`;
    }

    return `${seconds}s`;
}

/**
 * Extracts a readable type label from a JSON Schema property descriptor.
 */
export function formatSchemaType(prop: Record<string, unknown>): string {
    if (prop.enum) {
        return `enum`;
    }

    if (prop.type === 'array') {
        return 'array';
    }

    if (typeof prop.type === 'string') {
        return prop.type;
    }

    if (Array.isArray(prop.type)) {
        return prop.type.filter((t) => t !== 'null').join(' | ');
    }

    if (prop.anyOf) {
        const branches = prop.anyOf as Record<string, unknown>[];
        const types = branches
            .map((b) => b.type as string)
            .filter((t) => t && t !== 'null');
        if (types.length > 0) return types.join(' | ') + ' | null';
    }

    return 'unknown';
}

export function formatConstraints(prop: Record<string, unknown>): string {
    const parts: string[] = [];

    // For anyOf (nullable types), extract constraints from the non-null branch.
    const source = prop.anyOf
        ? ((prop.anyOf as Record<string, unknown>[]).find(
              (b) => b.type !== 'null'
          ) ?? prop)
        : prop;

    if (source.enum) {
        const values = source.enum as string[];
        if (values.length <= 5)
            parts.push(values.map((v) => `"${v}"`).join(', '));
        else parts.push(`${values.length} values`);
    }

    if (typeof source.minimum === 'number') {
        parts.push(`min: ${source.minimum}`);
    }

    if (typeof source.maximum === 'number') {
        parts.push(`max: ${source.maximum}`);
    }

    if (typeof source.minLength === 'number') {
        parts.push(`minLen: ${source.minLength}`);
    }

    if (typeof source.maxLength === 'number') {
        parts.push(`maxLen: ${source.maxLength}`);
    }

    if (typeof source.minItems === 'number') {
        parts.push(`minItems: ${source.minItems}`);
    }

    if (typeof source.maxItems === 'number') {
        parts.push(`maxItems: ${source.maxItems}`);
    }

    if (typeof source.format === 'string') {
        parts.push(source.format as string);
    }

    return parts.join(', ');
}

/**
 * Unwrap array and nullable wrappers from a JSON Schema. Returns metadata about the wrapper types.
 */
export function resolveSchemaForTable(schema: Record<string, unknown>): {
    properties: Record<string, Record<string, unknown>> | undefined;
    required: string[];
    isArray: boolean;
    isNullable: boolean;
} {
    let resolved = schema;
    let isArray = false;
    let isNullable = false;

    if (resolved.type === 'array' && resolved.items) {
        resolved = resolved.items as Record<string, unknown>;
        isArray = true;
    }

    // Unwrap anyOf (nullable) → first non-null branch
    if (resolved.anyOf) {
        const branches = resolved.anyOf as Record<string, unknown>[];

        const objectBranch = branches.find(
            (b) => b.type === 'object' || b.properties
        );

        if (objectBranch) {
            isNullable = branches.some((b) => b.type === 'null');
            resolved = objectBranch;
        }
    }

    return {
        properties: resolved.properties as
            | Record<string, Record<string, unknown>>
            | undefined,
        required: (resolved.required as string[]) ?? [],
        isArray,
        isNullable
    };
}

export function isPropertyNullable(prop: Record<string, unknown>): boolean {
    if (Array.isArray(prop.type)) {
        return prop.type.includes('null');
    }

    if (prop.anyOf) {
        return (prop.anyOf as Record<string, unknown>[]).some(
            (b) => b.type === 'null'
        );
    }

    return false;
}

export function getStatusColor(status: number): string {
    if (status >= 200 && status < 300) {
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }

    if (status >= 400 && status < 500) {
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    }

    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
}
