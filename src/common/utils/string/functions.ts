export function truncate(value: string, maxLen: number): string {
    return value.length > maxLen ? `${value.slice(0, maxLen)}…` : value;
}
