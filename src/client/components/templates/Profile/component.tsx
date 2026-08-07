'use client';

import { useAuth } from '@/client/store';
import React from 'react';
import { DesktopProfileTemplate } from './Desktop';
import { MobileProfileTemplate } from './Mobile';
import { ProfileTab, type ProfileNavigationItem } from '@/client/types/core';
import type { Cookbook, RecipeForDisplayDTO, User } from '@/common/types';
import { Cookbooks } from '@/client/components/organisms/Profile/Body/Cookbooks';
import { ProfileBodyInfo } from '@/client/components/organisms/Profile/Body/Info';
import { Recipes } from '@/client/components/organisms/Profile/Body/Recipes';
import { useRouter } from 'next/navigation';
import { GRID_COLS } from '@/client/constants';
import { PROFILE_FALLBACK_TAB } from '@/client/components/templates/Profile/tabs';
import { t } from '@/client/locales';

type ProfileProps = Readonly<{
    initialIsCurrentUser: boolean;
    initialTab?: ProfileTab | null;
    initialCookbooks?: Cookbook[];
    initialRecipes?: RecipeForDisplayDTO[];
    user: User;
}>;

export const ProfileTemplate: React.FC<ProfileProps> = ({
    user,
    initialTab = null,
    initialIsCurrentUser,
    initialCookbooks,
    initialRecipes
}) => {
    const router = useRouter();
    const { authResolved, user: currentUser } = useAuth();

    //~-----------------------------------------------------------------------------------------~//
    //$                                     VIEWER IDENTITY                                     $//
    //
    // Falls back to the server's answer until the current-user query resolves, rather than
    // reading false. Everything on this page keys off this flag, and a false negative is not a
    // cosmetic delay:
    //
    //   - the dashboard tab is absent from the tab set, so the tab the server selected cannot be
    //     mounted. Mobile falls back to index 0 and the recipes tab mounts and fetches page one
    //     over http - work the server neither seeded nor asked for.
    //   - the correction effect below sees "dashboard requested by a non-owner" and bounces to
    //     ?tab=recipes, which is a second render whose seed the recipes query then ignores,
    //     because the bounced-from render already filled that cache entry.
    //
    // Safe across hydration precisely because it is a server prop: the ssr pass and the first
    // client render read the same value, so there is nothing to reconcile. The client takes over
    // the moment auth resolves, which is what still corrects a session that died in between.
    //~-----------------------------------------------------------------------------------------~//

    const isCurrentUser = authResolved
        ? currentUser?.id === user.id
        : initialIsCurrentUser;

    // Resolved once, here, so both viewport templates mount the same tab. They render the same
    // content elements, so disagreeing would mount two tabs and fetch for the invisible one.
    // The raw prop is kept for the correction effect below, which needs to tell "no tab in the
    // url" apart from "the fallback tab".
    const resolvedInitialTab = initialTab ?? PROFILE_FALLBACK_TAB;

    const profileNavigationItems: ProfileNavigationItem[] = [
        ...(isCurrentUser
            ? [
                  {
                      param: ProfileTab.Dashboard,
                      label: t('app.profile.dashboard'),
                      content: <ProfileBodyInfo user={user} />
                  }
              ]
            : []),

        {
            param: ProfileTab.Recipes,
            label: t('app.profile.recipes'),
            content: (
                <Recipes
                    cols={{
                        sm: GRID_COLS[2] ?? 'grid-cols-2',
                        md: GRID_COLS[2] ?? 'grid-cols-2',
                        lg: GRID_COLS[3] ?? 'grid-cols-3',
                        xl: GRID_COLS[3] ?? 'grid-cols-3'
                    }}
                    initialRecipes={initialRecipes}
                    isCurrentUser={isCurrentUser}
                    userId={user.id}
                />
            )
        },
        {
            param: ProfileTab.Cookbooks,
            label: t('app.profile.cookbooks'),
            content: (
                <Cookbooks
                    initialCookbooks={initialCookbooks}
                    isCurrentUser={isCurrentUser}
                    userId={user.id}
                />
            )
        }
    ];

    //~-----------------------------------------------------------------------------------------~//
    //$                                     TAB CORRECTION                                      $//
    //
    // The server resolves the tab and redirects when the url disagrees, so this is only a safety
    // net for the case the server cannot see: a session that stops being valid between its render
    // and this hydration. It therefore has to wait for auth - correcting on an unresolved
    // identity is how the owner used to get bounced off their own dashboard.
    //
    // Written as a plain effect on purpose. useRunOnce marks itself as run even when its callback
    // returns early, so gating inside one would spend the single pass on the unresolved render
    // and the deferred correction would never fire at all.
    //~-----------------------------------------------------------------------------------------~//

    const hasCorrectedTab = React.useRef(false);

    React.useEffect(() => {
        if (!authResolved || hasCorrectedTab.current) {
            return;
        }

        hasCorrectedTab.current = true;

        const currentUrl = new URL(window.location.href);

        /**
         * If the URL doesn't have a tab, set it to the default tab.
         */
        if (!initialTab) {
            currentUrl.searchParams.set(
                'tab',
                isCurrentUser ? ProfileTab.Dashboard : ProfileTab.Recipes
            );
        } else if (initialTab === ProfileTab.Dashboard && !isCurrentUser) {
            /**
             * If the user is not the current user and the tab is dashboard, set it to recipes.
             */
            currentUrl.searchParams.set('tab', ProfileTab.Recipes);
        } else {
            return;
        }

        router.replace(currentUrl.pathname + currentUrl.search, {
            scroll: false
        });
    }, [authResolved, initialTab, isCurrentUser, router]);

    return (
        <React.Fragment>
            <DesktopProfileTemplate
                className={'hidden md:block'}
                items={profileNavigationItems}
                user={user}
                isCurrentUser={isCurrentUser}
                initialTab={resolvedInitialTab}
            />
            <MobileProfileTemplate
                className={'md:hidden'}
                items={profileNavigationItems}
                user={user}
                isCurrentUser={isCurrentUser}
                initialTab={resolvedInitialTab}
            />
        </React.Fragment>
    );
};
