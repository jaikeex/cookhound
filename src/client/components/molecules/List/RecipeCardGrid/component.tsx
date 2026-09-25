import { RecipeCard } from '@/client/components/molecules/Card/Recipe';
import { RecipeWithHandling } from '@/client/components/molecules/Card/RecipeWithHandling';
import { GRID_COLS } from '@/client/constants';
import type { RecipeForDisplayDTO } from '@/common/types';
import * as React from 'react';

//~---------------------------------------------------------------------------------------------~//
//$                                           OPTIONS                                           $//
//~---------------------------------------------------------------------------------------------~//

export type RecipeCardListGridColumns = {
    sm: (typeof GRID_COLS)[keyof typeof GRID_COLS];
    md: (typeof GRID_COLS)[keyof typeof GRID_COLS];
    lg: (typeof GRID_COLS)[keyof typeof GRID_COLS];
    xl: (typeof GRID_COLS)[keyof typeof GRID_COLS];
};

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export type RecipeCardGridProps = Readonly<{
    className?: string;
    cols?: RecipeCardListGridColumns;
    recipes: RecipeForDisplayDTO[];
    withHandling?: boolean;
}>;

const RecipeCardGridComponent: React.FC<RecipeCardGridProps> = ({
    className,
    cols = {
        sm: GRID_COLS[2],
        md: GRID_COLS[3],
        lg: GRID_COLS[4],
        xl: GRID_COLS[4]
    },
    recipes,
    withHandling = false
}) => {
    const RecipeCardComponent = withHandling ? RecipeWithHandling : RecipeCard;

    // If you ask why this is necessary... it's hydration... it's always hydration...
    const baseClasses = `grid ${cols.sm} gap-4 md:${cols.md} lg:${cols.lg} xl:${cols.xl}`;
    const finalClassName = className
        ? `${baseClasses} ${className}`
        : baseClasses;

    return (
        <React.Fragment>
            {/* these classes are added dynamically, they need to exist at build time for tailwind compiler to register them */}
            <span className="hidden lg:grid-cols-3 xl:grid-cols-3" />
            <div className={finalClassName}>
                {recipes.map((recipe, index) => (
                    <RecipeCardComponent
                        key={`${recipe.id}`}
                        id={recipe.id}
                        displayId={recipe.displayId}
                        title={recipe.title}
                        imageUrl={recipe.imageUrl}
                        rating={recipe.rating}
                        time={recipe.time ?? 0}
                        portionSize={recipe.portionSize ?? 0}
                        index={index}
                        flags={recipe.flags ?? null}
                    />
                ))}
            </div>
        </React.Fragment>
    );
};

export const RecipeCardGrid = React.memo(RecipeCardGridComponent);
