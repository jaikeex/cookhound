'use client';

import React from 'react';
import { DesktopRecipeBody } from '@/client/components/organisms/Recipe/View/Desktop/DesktopRecipeBody';
import { DesktopRecipeHead } from '@/client/components/organisms/Recipe/View/Desktop/DesktopRecipeHead';
import { Divider } from '@/client/components/atoms/Divider';
import { Typography } from '@/client/components/atoms/Typography';
import { useRecipeHandling } from '@/client/store';

export type DesktopRecipeViewProps = Readonly<{
    className?: string;
    isPreview?: boolean;
    ref?: React.RefObject<HTMLElement> | null;
}>;

export const DesktopRecipeViewTemplate: React.FC<DesktopRecipeViewProps> = ({
    className,
    isPreview,
    ref
}) => {
    const { recipe, rateRecipe, onShoppingListCreate } = useRecipeHandling();

    return (
        <article
            className={`px-2 mx-auto max-w-screen-sm md:max-w-3xl 3xl:max-w-5xl ${className}`}
            ref={ref}
        >
            <div className={'space-y-4'}>
                <DesktopRecipeHead
                    recipe={recipe}
                    isPreview={isPreview}
                    onRateRecipe={rateRecipe}
                />

                {recipe.description ? (
                    <Typography variant="body">{recipe.description}</Typography>
                ) : null}

                <Divider />

                <DesktopRecipeBody
                    recipe={recipe}
                    isPreview={isPreview}
                    onShoppingListCreate={onShoppingListCreate}
                />
            </div>
        </article>
    );
};
