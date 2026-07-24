'use client';

import React from 'react';
import { Divider } from '@/client/components/atoms/Divider';
import { MobileRecipeBody } from '@/client/components/organisms/Recipe/View/Mobile/MobileRecipeBody';
import { MobileRecipeHead } from '@/client/components/organisms/Recipe/View/Mobile/MobileRecipeHead';
import { Typography } from '@/client/components/atoms/Typography';
import { useRecipeHandling } from '@/client/store';

export type MobileRecipeViewProps = Readonly<{
    className?: string;
    isPreview?: boolean;
}>;

export const MobileRecipeViewTemplate: React.FC<MobileRecipeViewProps> = ({
    className,
    isPreview = false
}) => {
    const { recipe, rateRecipe, onShoppingListCreate } = useRecipeHandling();

    return (
        <article className={`max-w-3xl mx-auto ${className}`}>
            <div className={'space-y-4'}>
                <MobileRecipeHead
                    recipe={recipe}
                    isPreview={isPreview}
                    onRateRecipe={rateRecipe}
                />

                {recipe.description ? (
                    <Typography variant="body" align="center">
                        {recipe.description}
                    </Typography>
                ) : null}

                <Divider />

                <MobileRecipeBody
                    recipe={recipe}
                    isPreview={isPreview}
                    onShoppingListCreate={onShoppingListCreate}
                />
            </div>
        </article>
    );
};
