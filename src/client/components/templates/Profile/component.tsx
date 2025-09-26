'use client';

import { useAuth, useLocale } from '@/client/store';
import React, { use } from 'react';
import { DesktopProfileTemplate } from './Desktop';
import { MobileProfileTemplate } from './Mobile';
import { ProfileTab, type ProfileNavigationItem } from '@/client/types/core';
import type { UserDTO } from '@/common/types';
import { Cookbooks, ProfileBodyInfo, Recipes } from '@/client/components';
import { useRouter } from 'next/navigation';
import { GRID_COLS } from '@/client/constants';
import { useRunOnce } from '@/client/hooks';

type ProfileProps = Readonly<{
    initialTab?: ProfileTab | null;
    user: Promise<UserDTO>;
}>;

export const ProfileTemplate: React.FC<ProfileProps> = ({
    user,
    initialTab = null
}) => {
    const userResolved = use(user);
    const router = useRouter();

    const { t } = useLocale();
    const { authResolved, user: currentUser } = useAuth();

    const isCurrentUser = authResolved && currentUser?.id === userResolved.id;

    const profileNavigationItems: ProfileNavigationItem[] = [
        ...(isCurrentUser
            ? [
                  {
                      param: ProfileTab.Dashboard,
                      label: t('app.profile.dashboard'),
                      content: (
                          <ProfileBodyInfo user={currentUser ?? userResolved} />
                      )
                  }
              ]
            : []),

        {
            param: ProfileTab.Recipes,
            label: t('app.profile.recipes'),
            content: (
                <Recipes
                    cols={{
                        sm: GRID_COLS[2],
                        md: GRID_COLS[2],
                        lg: GRID_COLS[3],
                        xl: GRID_COLS[3]
                    }}
                    isCurrentUser={isCurrentUser}
                    userId={currentUser?.id ?? userResolved.id}
                />
            )
        },
        {
            param: ProfileTab.Cookbooks,
            label: t('app.profile.cookbooks'),
            content: (
                <Cookbooks
                    isCurrentUser={isCurrentUser}
                    userId={currentUser?.id ?? userResolved.id}
                />
            )
        }
    ];

    useRunOnce(() => {
        const currentUrl = new URL(window.location.href);

        /**
         * If the URL doesn't have a tab, set it to the default tab.
         */
        if (!initialTab) {
            currentUrl.searchParams.set(
                'tab',
                isCurrentUser ? ProfileTab.Dashboard : ProfileTab.Recipes
            );

            router.replace(currentUrl.pathname + currentUrl.search, {
                scroll: false
            });
        }

        /**
         * If the user is not the current user and the tab is dashboard, set it to recipes.
         */
        if (initialTab === ProfileTab.Dashboard && !isCurrentUser) {
            router.replace('/user/recipes', {
                scroll: false
            });

            currentUrl.searchParams.set('tab', ProfileTab.Recipes);

            router.replace(currentUrl.pathname + currentUrl.search, {
                scroll: false
            });
        }
    }, []);

    return (
        <React.Fragment>
            <DesktopProfileTemplate
                className={'hidden md:block'}
                items={profileNavigationItems}
                user={currentUser ?? userResolved}
                isCurrentUser={isCurrentUser}
                initialTab={initialTab}
            />
            <MobileProfileTemplate
                className={'md:hidden'}
                items={profileNavigationItems}
                user={currentUser ?? userResolved}
                isCurrentUser={isCurrentUser}
            />
        </React.Fragment>
    );
};
