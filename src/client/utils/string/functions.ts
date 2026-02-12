export function capitalizeFirstLetter(val: string): string {
    if (!val || typeof val !== 'string') return '';

    return val.charAt(0).toUpperCase() + val.slice(1);
}

export const lowerCaseFirstLetter = (val: string): string => {
    if (!val || typeof val !== 'string') return '';

    return val.charAt(0).toLowerCase() + val.slice(1);
};

export const multiplyNumberInString = (
    str: string | null,
    multiplier: number
): string => {
    if (!str || typeof str !== 'string' || str.length === 0) return '';

    const match = str.match(/-?\d+(\.\d+)?/);
    const targetNumber = match ? parseFloat(match[0]) : null;

    if (targetNumber === null) {
        return str;
    }

    const multipliedNumber = Number((targetNumber * multiplier).toFixed(2));
    const result = str.replace(String(targetNumber), String(multipliedNumber));

    return result;
};
