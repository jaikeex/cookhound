import React from 'react';
import { serverData } from '@/server/data';
import { mapServiceErrorForRsc } from '@/server/data/runtime/mapError';
import { RecipeStructuredData, RecipeViewTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/server/utils/seo';
import { ENV_CONFIG_PUBLIC, DEFAULT_LOCALE } from '@/common/constants';
import db from '@/server/db/model';

export const revalidate = 3600;

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

    const recipePromise = serverData.recipe
        .getByDisplayId(recipeDisplayId)
        .catch((error) =>
            mapServiceErrorForRsc(error, `/recipe/${recipeDisplayId}`)
        );

    return (
        <React.Fragment>
            <RecipeViewTemplate recipe={recipePromise} />
            <RecipeStructuredData recipePromise={recipePromise} />
        </React.Fragment>
    );
}

//|=============================================================================================|//

export async function generateStaticParams(): Promise<
    Array<{ displayId: string }>
> {
    return db.recipe.listDisplayIdsForStaticGeneration(undefined, 0); // no need to cache this
}

//|=============================================================================================|//

export async function generateMetadata({
    params
}: RecipePageParams): Promise<Metadata> {
    const paramsResolved = await params;
    const recipeDisplayId = paramsResolved.displayId;

    try {
        const recipe = await serverData.recipe.getByDisplayId(recipeDisplayId);

        const canonical = `${ENV_CONFIG_PUBLIC.ORIGIN}/recipe/${recipeDisplayId}`;

        const recipeDescription = recipe.description?.trim() || undefined;

        // The metadata language is an intrinsic property of the recipe (its
        // own content language), not of the visitor. Sourcing it from the
        // record rather than from cookies()/headers() keeps this route
        // statically renderable / ISR-eligible.
        return buildLocalizedMetadata(recipe.language, {
            titleKey: 'meta.recipe.title',
            descriptionKey: 'meta.recipe.description',
            ogTitleKey: 'meta.recipe.title',
            ogDescriptionKey: 'meta.recipe.description',
            description: recipeDescription,
            ogDescription: recipeDescription,
            twitterCard: 'summary_large_image',
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
        // Recipe could not be fetched (e.g. not found): we have no record to
        // read a language from, so fall back to the default locale. Still no
        // dynamic request APIs, so the route stays statically renderable.
        return buildLocalizedMetadata(DEFAULT_LOCALE, {
            titleKey: 'meta.recipe.fallback.title',
            descriptionKey: 'meta.recipe.fallback.description',
            canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}/recipe/${recipeDisplayId}`
        });
    }
}
