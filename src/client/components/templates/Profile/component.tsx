'use client';

import { useAuth } from '@/client/store';
import React, { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProfileTab, type ProfileNavigationItem } from '@/client/types/core';
import type { Cookbook, RecipeForDisplayDTO, User } from '@/common/types';
import type { TabContent } from '@/client/components/molecules/Tabs';
import { Cookbooks } from '@/client/components/organisms/Profile/Body/Cookbooks';
import { Menu } from '@/client/components/molecules/Menu';
import { ProfileBodyInfo } from '@/client/components/organisms/Profile/Body/Info';
import { ProfileHead } from '@/client/components/organisms/Profile/Head';
import { Recipes } from '@/client/components/organisms/Profile/Body/Recipes';
import { Tabs } from '@/client/components/molecules/Tabs';
import { useParamsChangeListener } from '@/client/hooks';
import { GRID_COLS } from '@/client/constants';
import { ROUTES } from '@/common/constants';
import {
    PROFILE_FALLBACK_TAB,
    resolveProfileTabIndex
} from '@/client/components/templates/Profile/tabs';
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
    const searchParams = useSearchParams();
    const { authResolved, user: currentUser } = useAuth();

    //~-----------------------------------------------------------------------------------------~//
    //$                                     VIEWER IDENTITY                                     $//
    //
    // Falls back to the server's answer until the current-user query resolves, rather than
    // reading false. Everything on this page keys off this flag, and a false negative is not a
    // cosmetic delay:
    //
    //   - the dashboard tab is absent from the tab set, so the tab the server selected cannot be
    //     mounted. The tab state falls back and the recipes tab mounts and fetches page one
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

    // The raw prop is kept for the correction effect below, which needs to tell "no tab in the
    // url" apart from "the fallback tab".
    const resolvedInitialTab = initialTab ?? PROFILE_FALLBACK_TAB;
    const [tab, setTab] = useState<ProfileTab>(resolvedInitialTab);

    const profileNavigationItems: ProfileNavigationItem[] = React.useMemo(
        () => [
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
        ],
        [isCurrentUser, user, initialRecipes, initialCookbooks]
    );

    const handleParamChange = useCallback(() => {
        setTab(
            (searchParams.get('tab') as ProfileTab | null) ??
                PROFILE_FALLBACK_TAB
        );
    }, [searchParams]);

    useParamsChangeListener({
        key: 'tab',
        onChange: handleParamChange
    });

    const activeIndex = resolveProfileTabIndex(profileNavigationItems, tab);
    const initialTabIndex = resolveProfileTabIndex(
        profileNavigationItems,
        resolvedInitialTab
    );

    const menuItems = profileNavigationItems.map((item) => ({
        href: `${ROUTES.user.detail(String(user.id))}?tab=${item.param}`,
        label: item.label
    }));

    const tabBarItems: TabContent[] = profileNavigationItems.map((item) => ({
        title: item.label,
        param: item.param,
        content: null
    }));

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
        <article className="md:page-wrapper md:px-4">
            <ProfileHead user={user} isCurrentUser={isCurrentUser} />

            <Tabs
                tabs={tabBarItems}
                activeTab={initialTabIndex}
                enableNavigation
                className="mt-4 md:hidden"
                buttonRowClassName="sticky top-14 z-10"
            />

            <div className="mt-3 min-h-16 md:mt-10 md:grid md:grid-cols-4 md:gap-12">
                <div className="hidden md:block md:col-span-1">
                    <Menu items={menuItems} />
                </div>

                <div className="md:col-span-3">
                    {profileNavigationItems[activeIndex]?.content}
                </div>
            </div>
        </article>
    );
};
