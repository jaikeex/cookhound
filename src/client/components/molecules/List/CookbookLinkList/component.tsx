'use client';

import React, { useMemo } from 'react';
import type { RecipeForDisplayDTO } from '@/common/types';
import { useScreenSize } from '@/client/hooks';
import { RecipeLink, Typography } from '@/client/components';
import { classNames } from '@/client/utils';
import { useLocale } from '@/client/store';

type CookbookRecipeLinkListProps = Readonly<{
    recipes: RecipeForDisplayDTO[];
}>;

export const CookbookRecipeLinkList: React.FC<CookbookRecipeLinkListProps> = ({
    recipes = []
}) => {
    const { isMobile } = useScreenSize();
    const { t } = useLocale();

    const MAX_PER_COLUMN = 10;
    const MAX_COLUMNS = isMobile ? 1 : 2;

    const visibleRecipes = recipes.slice(0, MAX_PER_COLUMN * MAX_COLUMNS);

    const columns = useMemo(
        () =>
            Array.from(
                {
                    length: Math.ceil(visibleRecipes.length / MAX_PER_COLUMN)
                },

                (_, columnIdx) =>
                    visibleRecipes.slice(
                        columnIdx * MAX_PER_COLUMN,
                        (columnIdx + 1) * MAX_PER_COLUMN
                    )
            ),
        [visibleRecipes]
    );

    const showMissingRecipesHint =
        recipes.length > MAX_PER_COLUMN * MAX_COLUMNS;

    return (
        <React.Fragment>
            <div className="flex items-start gap-4 justify-between w-full">
                {columns.map((columnRecipes, colIdx) => (
                    <div
                        key={colIdx}
                        className={classNames(
                            'flex flex-col',
                            isMobile ? 'basis-full' : 'basis-1/2'
                        )}
                    >
                        {columnRecipes.map((recipe) => (
                            <RecipeLink
                                key={recipe.id}
                                recipe={recipe}
                                className="py-1 w-4/6"
                            />
                        ))}
                    </div>
                ))}
            </div>

            {showMissingRecipesHint && (
                <Typography
                    variant={isMobile ? 'body-sm' : 'body-md'}
                    className="text-gray-500 self-center mt-2"
                >
                    {t('app.cookbook.see-more', {
                        count: recipes.length - MAX_PER_COLUMN * MAX_COLUMNS
                    })}
                </Typography>
            )}
        </React.Fragment>
    );
};
