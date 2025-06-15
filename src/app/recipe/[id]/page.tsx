import React, { Suspense } from 'react';
import apiClient from '@/client/request';
import {
    RecipeViewTemplate,
    DesktopRecipeViewSkeleton,
    MobileRecipeViewSkeleton
} from '@/client/components';

type RecipePageParams = {
    readonly params: Promise<
        Readonly<{
            id: string;
        }>
    >;
};

type RecipeLoaderProps = Readonly<{
    recipeId: string;
}>;

async function RecipeLoader({ recipeId }: RecipeLoaderProps) {
    const recipe = await apiClient.recipe.getRecipeById(recipeId, {
        revalidate: 3600
    });

    return <RecipeViewTemplate recipe={recipe} />;
}

function RecipeViewSkeleton() {
    return (
        <>
            <div className="hidden md:block">
                <DesktopRecipeViewSkeleton />
            </div>
            <div className="block md:hidden">
                <MobileRecipeViewSkeleton />
            </div>
        </>
    );
}

export default async function Page({ params }: RecipePageParams) {
    const paramsResolved = await params;
    const recipeId = paramsResolved.id;

    return (
        <Suspense fallback={<RecipeViewSkeleton />}>
            <RecipeLoader recipeId={recipeId} />
        </Suspense>
    );
}
