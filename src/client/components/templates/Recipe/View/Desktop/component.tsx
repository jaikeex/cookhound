'use client';

import React from 'react';
import {
    DesktopRecipeBody,
    DesktopRecipeHead,
    Divider
} from '@/client/components';
import { useRecipeHandling } from '@/client/store';

export type DesktopRecipeViewProps = Readonly<{
    className?: string;
    isPreview?: boolean;
    ref?: React.RefObject<HTMLDivElement> | null;
}>;

export const DesktopRecipeViewTemplate: React.FC<DesktopRecipeViewProps> = ({
    className,
    isPreview,
    ref
}) => {
    const { recipe, rateRecipe, onShoppingListCreate } = useRecipeHandling();

    return (
        <div
            className={`px-2 mx-auto max-w-screen-sm md:max-w-screen-md 3xl:max-w-screen-lg ${className}`}
            ref={ref}
        >
            <div className={'space-y-4'}>
                <DesktopRecipeHead
                    recipe={recipe}
                    isPreview={isPreview}
                    onRateRecipe={rateRecipe}
                />
                <Divider />

                <DesktopRecipeBody
                    recipe={recipe}
                    isPreview={isPreview}
                    onShoppingListCreate={onShoppingListCreate}
                />
            </div>
        </div>
    );
};
