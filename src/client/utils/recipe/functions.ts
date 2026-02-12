import { multiplyNumberInString } from '@/client/utils';

export const scaleIngredientsToPortionSize = <
    T extends { quantity: string | null }
>(
    ingredients: T[],
    originalPortionSize: number | null,
    targetPortionSize: number | null
): T[] => {
    if (!originalPortionSize || !targetPortionSize) {
        return ingredients;
    }

    if (originalPortionSize === targetPortionSize) {
        return ingredients;
    }

    const coef = targetPortionSize / originalPortionSize;

    return ingredients.map((ing) => ({
        ...ing,
        quantity: multiplyNumberInString(ing.quantity, coef)
    }));
};
