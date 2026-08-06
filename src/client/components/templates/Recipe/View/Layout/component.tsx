'use client';

import React from 'react';
import { Divider } from '@/client/components/atoms/Divider';
import { Typography } from '@/client/components/atoms/Typography';
import { RecipeViewBody } from '@/client/components/organisms/Recipe/View/Body';
import { RecipeViewHead } from '@/client/components/organisms/Recipe/View/Head';
import { useRecipeHandling } from '@/client/store';
import { classNames } from '@/client/utils';

export type RecipeViewLayoutProps = Readonly<{
    className?: string;
    isPreview?: boolean;
    ref?: React.RefObject<HTMLElement> | null;
}>;

export const RecipeViewLayout: React.FC<RecipeViewLayoutProps> = ({
    className,
    isPreview = false,
    ref
}) => {
    const { recipe, rateRecipe, onShoppingListCreate } = useRecipeHandling();

    return (
        <div
            className={classNames(
                '@container mx-auto max-w-3xl 3xl:max-w-5xl',
                className
            )}
        >
            <article className={'@recipe:px-2'} ref={ref}>
                <div className={'space-y-4'}>
                    <RecipeViewHead
                        recipe={recipe}
                        isPreview={isPreview}
                        onRateRecipe={rateRecipe}
                    />

                    {recipe.description ? (
                        <Typography
                            variant="body"
                            align="center"
                            className="@recipe:text-left"
                        >
                            {recipe.description}
                        </Typography>
                    ) : null}

                    <Divider />

                    <RecipeViewBody
                        recipe={recipe}
                        isPreview={isPreview}
                        onShoppingListCreate={onShoppingListCreate}
                    />
                </div>
            </article>
        </div>
    );
};
