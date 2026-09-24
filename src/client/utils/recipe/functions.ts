import { multiplyNumberInString } from '@/client/utils';
import { t } from '@/client/locales';

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

export const cooldownCaption = (seconds: number): string => {
    if (seconds === 1) return t('app.recipe.rate-again-in.one', { seconds });
    if (seconds <= 4) return t('app.recipe.rate-again-in.few', { seconds });

    return t('app.recipe.rate-again-in.many', { seconds });
};
