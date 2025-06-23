'use client';

import React from 'react';
import type { RecipeDTO } from '@/common/types/recipe';
import {
    DesktopRecipeBody,
    DesktopRecipeHead,
    Divider
} from '@/client/components';
import { useDisplayRecipe } from '@/client/components/templates/Recipe/View/useDisplayRecipe';

export type DesktopRecipeViewProps = Readonly<{
    className?: string;
    isPreview?: boolean;
    recipe: RecipeDTO;
    ref?: React.RefObject<HTMLDivElement> | null;
}>;

export const DesktopRecipeViewTemplate: React.FC<DesktopRecipeViewProps> = ({
    className,
    isPreview,
    recipe,
    ref
}) => {
    const { rateRecipe } = useDisplayRecipe(recipe);

    return (
        <div
            className={`max-w-screen-md px-4 mx-auto 3xl:max-w-screen-lg ${className}`}
            ref={ref}
        >
            <div className={'space-y-4'}>
                <DesktopRecipeHead
                    recipe={recipe}
                    isPreview={isPreview}
                    onRateRecipe={rateRecipe}
                />
                <Divider />

                <DesktopRecipeBody recipe={recipe} isPreview={isPreview} />
            </div>
        </div>
    );
};
