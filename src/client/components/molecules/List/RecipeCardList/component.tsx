import { RecipeCard } from '@/client/components';
import type { RecipeForDisplayDTO } from '@/common/types';
import classNames from 'classnames';
import * as React from 'react';

type RecipeCardListProps = Readonly<{
    className?: string;
    recipes: RecipeForDisplayDTO[];
}>;

export const RecipeCardList: React.FC<RecipeCardListProps> = ({
    className,
    recipes
}) => {
    return (
        <div
            className={classNames(
                'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4',
                className
            )}
        >
            {recipes.map((recipe, index) => (
                <RecipeCard
                    key={`${recipe.id}-${index}`}
                    displayId={recipe.displayId}
                    title={recipe.title}
                    imageUrl={recipe.imageUrl}
                    rating={recipe.rating}
                    time={recipe.time ?? 0}
                    portionSize={recipe.portionSize ?? 0}
                    index={index}
                />
            ))}
        </div>
    );
};
