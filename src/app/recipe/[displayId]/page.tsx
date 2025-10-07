import React from 'react';
import { apiClient } from '@/client/request';
import { RecipeStructuredData, RecipeViewTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { getLocalizedMetadata } from '@/server/utils/seo';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';

type RecipePageParams = {
    readonly params: Promise<
        Readonly<{
            displayId: string;
        }>
    >;
};

//|=============================================================================================|//

export default async function Page({ params }: RecipePageParams) {
    const paramsResolved = await params;
    const recipeDisplayId = paramsResolved.displayId;

    const recipePromise = apiClient.recipe.getRecipeByDisplayId(
        recipeDisplayId,
        {
            revalidate: 3600
        }
    );

    return (
        <React.Fragment>
            <RecipeViewTemplate recipe={recipePromise} />
            <RecipeStructuredData recipePromise={recipePromise} />
        </React.Fragment>
    );
}

//|=============================================================================================|//

export async function generateMetadata({
    params
}: RecipePageParams): Promise<Metadata> {
    const paramsResolved = await params;
    const recipeDisplayId = paramsResolved.displayId;
    const cookieStore = await cookies();
    const headerList = await headers();

    try {
        const recipe = await apiClient.recipe.getRecipeByDisplayId(
            recipeDisplayId,
            {
                revalidate: 3600
            }
        );

        const canonical = `${ENV_CONFIG_PUBLIC.ORIGIN}/recipe/${recipeDisplayId}`;

        return getLocalizedMetadata(cookieStore, headerList, {
            titleKey: 'meta.recipe.title',
            descriptionKey: 'meta.recipe.description',
            ogTitleKey: 'meta.recipe.title',
            ogDescriptionKey: 'meta.recipe.description',
            images: recipe.imageUrl ? [recipe.imageUrl] : [],
            params: { recipeTitle: recipe.title },
            canonical,
            type: 'article',
            publishedTime: recipe.createdAt.toISOString(),
            modifiedTime: recipe.updatedAt.toISOString(),
            authors: [recipe.authorId?.toString() ?? 'Cookhound User'],
            tags: recipe.tags?.map((tag) => tag.name) ?? []
        });
    } catch {
        return getLocalizedMetadata(cookieStore, headerList, {
            titleKey: 'meta.recipe.fallback.title',
            descriptionKey: 'meta.recipe.fallback.description',
            canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}/recipe/${recipeDisplayId}`
        });
    }
}
