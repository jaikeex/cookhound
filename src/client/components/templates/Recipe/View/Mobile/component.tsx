'use client';

import React from 'react';
import {
    Divider,
    MobileRecipeBody,
    MobileRecipeHead
} from '@/client/components';
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
        <div className={`max-w-screen-md mx-auto ${className}`}>
            <div className={'space-y-4'}>
                <MobileRecipeHead
                    recipe={recipe}
                    isPreview={isPreview}
                    onRateRecipe={rateRecipe}
                />
                <Divider />
                <MobileRecipeBody
                    recipe={recipe}
                    isPreview={isPreview}
                    onShoppingListCreate={onShoppingListCreate}
                />
            </div>
        </div>
    );
};
