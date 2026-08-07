import type { Metadata } from 'next';
import { ProfileTemplate } from '@/client/components/templates/Profile';
import { serverData } from '@/server/data';
import { ensureRenderContext } from '@/server/data/runtime/ensureContext';
import { mapServiceErrorForRsc } from '@/server/data/runtime/mapError';
import { ProfileTab } from '@/client/types/core';
import {
    ENV_CONFIG_PUBLIC,
    RECIPE_DISCOVERY_PER_PAGE,
    ROUTES
} from '@/common/constants';
import { notFound, redirect } from 'next/navigation';
import { RequestContext } from '@/server/utils/reqwest/context';
import React from 'react';
import { buildLocalizedMetadata } from '@/common/utils/seo';
import { UserStructuredData } from '@/client/components';
import { Logger } from '@/server/logger';
import type { Cookbook, RecipeForDisplayDTO } from '@/common/types';

const log = Logger.getInstance('user-profile-page');

/**
 * A tab seed is an optimization, never the source of truth: the tab's own query
 * fetches over http whenever the seed arrives as undefined.
 */
const seedOrUnseeded = async <T,>(
    seed: Promise<T[]>,
    tab: ProfileTab,
    userId: number
): Promise<T[] | undefined> => {
    try {
        return await seed;
    } catch (error: unknown) {
        log.warn('seed failed - falling back to the client fetch', {
            error,
            tab,
            userId
        });

        return undefined;
    }
};

//|=============================================================================================|//

type UserProfilePageParams = {
    readonly params: Promise<
        Readonly<{
            id: string;
        }>
    >;
    readonly searchParams: Promise<{ tab?: ProfileTab }>;
};

//|=============================================================================================|//

async function renderProfile(
    id: number,
    incomingTab: ProfileTab | null
): Promise<React.ReactElement> {
    //~-----------------------------------------------------------------------------------------~//
    //$                                     TAB SEED SCOPE                                      $//
    //#
    //# Seeded off the INCOMING tab param rather than the resolved one, because the two can only
    //# differ on a request that redirects instead of rendering (see below) - so the seed is
    //# always for the tab this response actually shows, and no read is spent on a tab that is
    //# never mounted. The dashboard tab is settings only and has nothing to seed.
    //~-----------------------------------------------------------------------------------------~//

    const recipesSeed: Promise<RecipeForDisplayDTO[] | undefined> =
        incomingTab === ProfileTab.Recipes
            ? seedOrUnseeded(
                  serverData.recipe.listByUser(
                      id,
                      1,
                      RECIPE_DISCOVERY_PER_PAGE
                  ),
                  ProfileTab.Recipes,
                  id
              )
            : Promise.resolve(undefined);

    const cookbooksSeed: Promise<Cookbook[] | undefined> =
        incomingTab === ProfileTab.Cookbooks
            ? seedOrUnseeded(
                  serverData.cookbook.listByOwner(id),
                  ProfileTab.Cookbooks,
                  id
              )
            : Promise.resolve(undefined);

    // Resolve the user BEFORE any redirect or JSX. If the fetch only failed
    // later, deep inside the render, the response status would already be
    // committed as 200 and a missing user would be served as a soft 404.
    const [user, initialRecipes, initialCookbooks] = await Promise.all([
        serverData.user
            .getById(id)
            .catch((error) =>
                mapServiceErrorForRsc(error, ROUTES.user.detail(id))
            ),
        recipesSeed,
        cookbooksSeed
    ]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                     VIEWER IDENTITY                                     $//
    //# Read from the ambient context rather than validating the session again. The context this
    //# render opened already resolved the caller, and its userId is populated only for a session
    //# that validated, so this is exactly the old isLoggedIn && session.userId === id.
    //#
    //# Owner only, deliberately: an admin is not the profile owner and must not land on the
    //# dashboard tab or see the owner-only controls.
    //#
    //# Note this degrades to "guest" if the session lookup failed (buildContext swallows its own
    //# errors), where the old explicit check threw. That is the better failure for this page - it
    //# renders public and ProfileTemplate corrects isCurrentUser from useAuth() after hydration.
    //#
    //# The answer is handed to the template as its pre-hydration value. Its own useAuth() based
    //# check cannot resolve until the current-user query lands, and a false negative there costs
    //# more than a round trip: the dashboard tab would be missing from the tab set the server
    //# just selected, so the wrong tab mounts and fetches, and the correction effect bounces the
    //# owner off their own dashboard.
    //~-----------------------------------------------------------------------------------------~//

    const isCurrentUser = RequestContext.getUserId() === id;

    let resolvedTab: ProfileTab;

    if (!incomingTab) {
        resolvedTab = isCurrentUser ? ProfileTab.Dashboard : ProfileTab.Recipes;
    } else if (incomingTab === ProfileTab.Dashboard && !isCurrentUser) {
        resolvedTab = ProfileTab.Recipes;
    } else {
        resolvedTab = incomingTab;
    }

    if (resolvedTab !== incomingTab) {
        redirect(`${ROUTES.user.detail(id)}?tab=${resolvedTab}`);
    }

    return (
        <React.Fragment>
            <ProfileTemplate
                user={user}
                initialTab={resolvedTab}
                initialIsCurrentUser={isCurrentUser}
                initialRecipes={initialRecipes}
                initialCookbooks={initialCookbooks}
            />
            <UserStructuredData user={user} />
        </React.Fragment>
    );
}

//|=============================================================================================|//

export default async function UserProfilePage({
    params,
    searchParams
}: UserProfilePageParams) {
    const paramsResolved = await params;
    const searchParamsResolved = await searchParams;

    const id = Number(paramsResolved.id);

    if (isNaN(id)) notFound();

    return ensureRenderContext(() =>
        renderProfile(id, searchParamsResolved.tab ?? null)
    );
}

//|=============================================================================================|//

export async function generateMetadata({
    params
}: UserProfilePageParams): Promise<Metadata> {
    const { id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
        return buildLocalizedMetadata({
            titleKey: 'meta.user.fallback.title',
            descriptionKey: 'meta.user.fallback.description',
            noindex: true
        });
    }

    try {
        const user = await serverData.user.getById(numericId);

        return buildLocalizedMetadata({
            titleKey: 'meta.user.title',
            descriptionKey: 'meta.user.description',
            images: user.avatarUrl ? [user.avatarUrl] : ['/img/anonymous.webp'],
            twitterCard: 'summary',
            params: { username: user.username },
            canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.user.detail(numericId)}`,
            type: 'profile'
        });
    } catch {
        return buildLocalizedMetadata({
            titleKey: 'meta.user.fallback.title',
            descriptionKey: 'meta.user.fallback.description',
            noindex: true
        });
    }
}
