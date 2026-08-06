import React from 'react';
import { permanentRedirect } from 'next/navigation';
import { serverData } from '@/server/data';
import { mapServiceErrorForRsc } from '@/server/data/runtime/mapError';
import { RecipeStructuredData, RecipeViewTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/common/utils/seo';
import {
    ENV_CONFIG_PUBLIC,
    ROUTES,
    RECIPE_DISPLAY_ID_REGEX
} from '@/common/constants';
import { slugifyRecipeTitle } from '@/common/utils/titleSlug';
import db from '@/server/db/model';
import { guardRecipeDisplayId } from '@/app/recept/[displayId]/_lib/displayIdGuard';

//?—————————————————————————————————————————————————————————————————————————————————————?//
//?                                    BUILD WARMUP                                     ?//
///
//# The number of recipes prerendered at build time must be capped.
//# Primary problem here is the db connection pool. The do postgres i am using
//# has a cap of 22, which, surprisingly, is not that hard to exhaust during build.
//# There is another layer of defense in the dockerfile, setting connection limit
//# to 1 on the db connection string for the build only, but just to drive the point
//# home and to tell future me this might be a problem, this guard exists.
///
//?—————————————————————————————————————————————————————————————————————————————————————?//

export const revalidate = 3600;
export const dynamicParams = true;

const SSG_PREWARM_LIMIT = 30;

type RecipePageParams = {
    readonly params: Promise<
        Readonly<{
            displayId: string;
            titleSlug?: string[];
        }>
    >;
};

//|=============================================================================================|//

export default async function Page({ params }: RecipePageParams) {
    const paramsResolved = await params;
    const recipeDisplayId = paramsResolved.displayId;

    const legacyTarget = await guardRecipeDisplayId(recipeDisplayId);

    if (legacyTarget) {
        permanentRedirect(
            ROUTES.recipe.detail(legacyTarget.displayId, legacyTarget.title)
        );
    }

    // Resolve the recipe BEFORE returning any JSX. If the fetch only failed
    // later, deep inside the render, the response status would already be
    // committed as 200 and a missing recipe would be served as a soft 404.
    const recipe = await serverData.recipe
        .getByDisplayId(recipeDisplayId)
        .catch((error) =>
            mapServiceErrorForRsc(error, ROUTES.recipe.detail(recipeDisplayId))
        );

    const canonicalTitleSlug = slugifyRecipeTitle(recipe.title);
    const requestTitleSlug = paramsResolved.titleSlug?.join('/') ?? '';

    if (requestTitleSlug !== canonicalTitleSlug) {
        permanentRedirect(ROUTES.recipe.detail(recipeDisplayId, recipe.title));
    }

    // A missing author must not break the schema block.
    const authorName = await serverData.user
        .getByIdPublic(recipe.authorId)
        .then((author) => author.username)
        .catch(() => undefined);

    return (
        <React.Fragment>
            <RecipeViewTemplate recipe={recipe} />
            <RecipeStructuredData recipe={recipe} authorName={authorName} />
        </React.Fragment>
    );
}

//|=============================================================================================|//

export async function generateStaticParams(): Promise<
    Array<{ displayId: string; titleSlug: string[] }>
> {
    const recipes = await db.recipe.listDisplayIdsForStaticGeneration(
        SSG_PREWARM_LIMIT,
        0 // no need to cache this
    );

    // Prewarm the canonical title slug urls — the bare id path is just a cached 308.
    // Titles that slugify to '' are skipped (their canonical IS the bare path).
    return recipes.flatMap(({ displayId, title }) => {
        const titleSlug = slugifyRecipeTitle(title);
        return titleSlug ? [{ displayId, titleSlug: [titleSlug] }] : [];
    });
}

//|=============================================================================================|//

export async function generateMetadata({
    params
}: RecipePageParams): Promise<Metadata> {
    const paramsResolved = await params;
    const recipeDisplayId = paramsResolved.displayId;

    // Legacy uuids and garbage params answer with a 308/404, whose metadata is
    // never rendered — skip the db and return the generic fallback.
    // (`mapServiceErrorForRsc` stays forbidden here: notFound()/redirect() are
    // no-ops inside generateMetadata.)
    if (!RECIPE_DISPLAY_ID_REGEX.test(recipeDisplayId)) {
        return buildLocalizedMetadata({
            titleKey: 'meta.recipe.fallback.title',
            descriptionKey: 'meta.recipe.fallback.description',
            canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.recipe.detail(recipeDisplayId)}`,
            noindex: true
        });
    }

    try {
        const recipe = await serverData.recipe.getByDisplayId(recipeDisplayId);

        const author = await serverData.user
            .getByIdPublic(recipe.authorId)
            .catch(() => null);

        // The canonical always points at the title slug url, whatever path was hit.
        const canonical = `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.recipe.detail(recipeDisplayId, recipe.title)}`;

        const recipeDescription = recipe.description?.trim() || undefined;

        // No dynamic request APIs are used here, which keeps this route ISR-eligible.
        return buildLocalizedMetadata({
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
            authors: [author?.username ?? 'Cookhound User'],
            tags: recipe.tags?.map((tag) => tag.name) ?? []
        });
    } catch {
        // Recipe could not be fetched (e.g. not found): emit generic fallback
        // metadata. Still no dynamic request APIs, so the route stays
        // statically renderable.
        return buildLocalizedMetadata({
            titleKey: 'meta.recipe.fallback.title',
            descriptionKey: 'meta.recipe.fallback.description',
            canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.recipe.detail(recipeDisplayId)}`,
            noindex: true
        });
    }
}
