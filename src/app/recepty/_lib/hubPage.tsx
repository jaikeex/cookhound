import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { serverData } from '@/server/data';
import { HubTemplate, StructuredData } from '@/client/components';
import {
    buildHubTitle,
    buildHubIntro,
    buildHubPath,
    getHubSiblings,
    HUB_UI,
    HUB_INDEXABLE_THRESHOLD,
    ENV_CONFIG_PUBLIC,
    DEFAULT_LOCALE,
    ROUTES
} from '@/common/constants';
import {
    buildLocalizedMetadata,
    generateBreadcrumbSchema,
    generateItemListSchema
} from '@/server/utils/seo';
import { serializeFilterParams } from '@/common/utils';

/**
 * Renders one page of a tag hub. Throws notFound() for unknown hub slugs and
 * for page numbers beyond the hub's real page count.
 */
export async function renderHubPage(
    hubSlug: string,
    page: number
): Promise<React.ReactElement> {
    const hub = await serverData.hub.getHub(hubSlug);

    if (!hub || page > hub.pageCount) {
        notFound();
    }

    const recipes = await serverData.hub.listRecipes(hub.tag.id, page);

    const title = buildHubTitle(hub.dbSlug, hub.tag.name, hub.tag.categoryId);
    const intro = buildHubIntro(hub.dbSlug, hub.tag.name);

    const siblings = getHubSiblings(hub.dbSlug, hub.tag.categoryId);

    const origin = ENV_CONFIG_PUBLIC.ORIGIN;

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: HUB_UI.breadcrumbHome, url: origin },
        { name: title, url: `${origin}${buildHubPath(hubSlug, 1)}` }
    ]);

    // ItemList only on page 1
    const itemListSchema =
        page === 1 && recipes.length > 0
            ? generateItemListSchema(
                  recipes.map((recipe) => ({
                      name: recipe.title,
                      url: `${origin}${ROUTES.recipe.detail(recipe.displayId)}`,
                      image: recipe.imageUrl || undefined
                  })),
                  title
              )
            : null;

    return (
        <React.Fragment>
            <HubTemplate
                filterHref={`${ROUTES.filter}?${serializeFilterParams({ tags: [hub.tag.id] })}`}
                hubSlug={hubSlug}
                intro={intro}
                page={page}
                pageCount={hub.pageCount}
                recipes={recipes}
                siblings={siblings}
                title={title}
            />
            <StructuredData
                schema={breadcrumbSchema}
                id="hub-breadcrumb-jsonld"
            />
            {itemListSchema && (
                <StructuredData
                    schema={itemListSchema}
                    id="hub-itemlist-jsonld"
                />
            )}
        </React.Fragment>
    );
}

export const parsePageNumber = (raw: string): number | null => {
    if (!/^\d+$/.test(raw)) {
        return null;
    }

    const page = Number(raw);

    // Reject non-normalized segments ('02', '0003') so every page has exactly
    // one url, otherwise they would serve 200 duplicates of the real page.
    if (String(page) !== raw) {
        return null;
    }

    return page >= 2 ? page : null;
};

/**
 * Generic, noindex metadata for a hub url that resolves to no real page.
 */
export function buildHubFallbackMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata(DEFAULT_LOCALE, {
        titleKey: 'meta.hub.fallback.title',
        descriptionKey: 'meta.hub.fallback.description',
        noindex: true
    });
}

export async function buildHubMetadata(
    hubSlug: string,
    page: number
): Promise<Metadata> {
    const hub = await serverData.hub.getHub(hubSlug);

    if (!hub || page > hub.pageCount) {
        return buildHubFallbackMetadata();
    }

    const baseTitle = buildHubTitle(
        hub.dbSlug,
        hub.tag.name,
        hub.tag.categoryId
    );
    const hubTitle = page > 1 ? `${baseTitle} — strana ${page}` : baseTitle;

    const canonical = `${ENV_CONFIG_PUBLIC.ORIGIN}${buildHubPath(hubSlug, page)}`;

    const intro = buildHubIntro(hub.dbSlug, hub.tag.name);
    const description = page > 1 ? `Strana ${page}: ${intro}` : intro;

    return buildLocalizedMetadata(DEFAULT_LOCALE, {
        titleKey: 'meta.hub.title',
        description,
        params: { hubTitle },
        canonical,
        noindex: hub.recipeCount < HUB_INDEXABLE_THRESHOLD,
        noindexFollow: true
    });
}
