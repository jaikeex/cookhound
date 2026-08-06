import React, { cache } from 'react';
import type { Metadata } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { HubIndexTemplate, StructuredData } from '@/client/components';
import { serverData } from '@/server/data';
import {
    buildLocalizedMetadata,
    buildHubClusterCrumbs,
    generateBreadcrumbSchema,
    generateCollectionPageSchema,
    generateItemListSchema
} from '@/common/utils/seo';
import { Logger } from '@/server/logger';
import {
    ALL_HUB_INDEX_GROUPS,
    buildHubShortLabel,
    buildHubTitle,
    ENV_CONFIG_PUBLIC,
    HUB_INDEX_UI,
    ROUTES,
    type HubIndexGroup
} from '@/common/constants';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                       TAG HUB INDEX                                         ?//
///
//# The entry point of the hub cluster. Before this page existed, /recepty answered with a 404
//# and the hubs were only reachable from the sitemap and from each other - no internal links
//# pointed into them from anywhere else on the site.
//#
//# This is the only page that links to the whole cluster at once, and it sits in the footer of
//# every page - so it is where the cluster's internal link equity gets allocated. It therefore
//# lists only hubs at or above a constant number: the same gate buildHubMetadata uses for
//# the robots directive and the sitemap uses for submission. Linking prominently to a hub the
//# site tells crawlers to ignore spends a link slot on a page that cannot rank, and sends the
//# user who clicks it to an empty category.
//#
//# That gate needs a count, so the route is ISR rather than prerendered once. It is still static
//# html, regenerated on a window matching the C2 redis ttl behind the query (6h), so most
//# revalidations never reach postgres - and the cache entry is shared with the sitemap, which
//# calls the same query with the same threshold.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

export const revalidate = 21600; // 6 hours

const log = Logger.getInstance('hub-index-page');

//|=============================================================================================|//

/**
 * Loads the listing.
 *
 * What a failed load should do depends entirely on whether there is already a
 * good page to preserve, and the two cases want opposite handling:
 *
 * - The build's prerender has none, and throwing there fails the build. So it
 *   renders the countless full hub list instead: one build's worth of flat
 *   linking, including to hubs below the threshold, beats shipping no page.
 *
 * - At runtime there always is one, because this route is prerendered, and next
 *   keeps serving the last good render when a background revalidation throws.
 *   Falling back here would replace it with links to hubs the site's own robots
 *   directive marks noindex - and cache that for the full revalidate window,
 *   long after the database recovered. So the error is rethrown and the good
 *   page stands.
 */
const loadGroups = cache(async (): Promise<readonly HubIndexGroup[]> => {
    try {
        return await serverData.hub.getIndexGroups();
    } catch (error: unknown) {
        if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
            log.error(
                'Failed to load hub index groups, keeping the last good page',
                { error }
            );

            throw error;
        }

        log.error(
            'Failed to load hub index groups during build, falling back to all hubs',
            { error }
        );

        return ALL_HUB_INDEX_GROUPS;
    }
});

//|=============================================================================================|//

export default async function Page() {
    const groups = await loadGroups();

    const origin = ENV_CONFIG_PUBLIC.ORIGIN;

    const breadcrumbSchema = generateBreadcrumbSchema(
        buildHubClusterCrumbs(origin)
    );

    const sections = groups.map((group) => ({
        categoryKey: group.categoryKey,
        hubs: group.hubs.map((hub) => ({
            hubSlug: hub.hubSlug,
            path: hub.path,
            label: buildHubShortLabel(hub.dbSlug, hub.name, hub.categoryId),
            title: buildHubTitle(hub.dbSlug, hub.name, hub.categoryId),
            recipeCount: hub.recipeCount
        }))
    }));

    // Flat across categories on purpose: the ItemList enumerates the pages this
    // one points at, and the grouping is already carried by the headings.
    const listedHubs = sections.flatMap((section) => section.hubs);

    const itemListSchema =
        listedHubs.length > 0
            ? generateItemListSchema(
                  listedHubs.map((hub) => ({
                      name: hub.title,
                      url: `${origin}${hub.path}`
                  })),
                  HUB_INDEX_UI.title
              )
            : undefined;

    // The list is the page's main entity, so it hangs off the CollectionPage
    // rather than sitting beside it as a second unattached node.
    const collectionSchema = generateCollectionPageSchema({
        name: HUB_INDEX_UI.title,
        description: HUB_INDEX_UI.intro,
        url: `${origin}${ROUTES.hub.index}`,
        mainEntity: itemListSchema
    });

    return (
        <React.Fragment>
            <HubIndexTemplate sections={sections} />

            <StructuredData
                schema={collectionSchema}
                id="hub-index-collection-jsonld"
            />

            <StructuredData
                schema={breadcrumbSchema}
                id="hub-index-breadcrumb-jsonld"
            />
        </React.Fragment>
    );
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const groups = await loadGroups();

    return buildLocalizedMetadata({
        titleKey: 'meta.hub-index.title',
        descriptionKey: 'meta.hub-index.description',
        canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.hub.index}`,
        noindex: groups.length === 0,
        noindexFollow: true
    });
}
