export function capitalizeFirstLetter(val: string): string {
    if (!val || typeof val !== 'string') return '';

    return val.charAt(0).toUpperCase() + val.slice(1);
}

export const lowerCaseFirstLetter = (val: string): string => {
    if (!val || typeof val !== 'string') return '';

    return val.charAt(0).toLowerCase() + val.slice(1);
};
