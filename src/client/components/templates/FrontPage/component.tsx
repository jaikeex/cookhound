'use client';

import type { RecipeForDisplayDTO } from '@/common/types';
import React, { use } from 'react';
import { RecipeCard } from '@/client/components/molecules';

type FrontPageProps = Readonly<{
    recipes: Promise<RecipeForDisplayDTO[]>;
}>;

export const FrontPageTemplate: React.FC<FrontPageProps> = ({ recipes }) => {
    const recipesResolved = use(recipes);

    return (
        <div className="grid max-w-screen-sm grid-cols-2 gap-4 px-2 mx-auto md:max-w-screen-md 3xl:max-w-screen-lg md:grid-cols-3">
            {recipesResolved.map((recipe, index) => (
                <RecipeCard
                    key={recipe.id}
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
