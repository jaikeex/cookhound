'use client';

import { useAuth } from '@/client/store';
import React from 'react';
import { DesktopProfileTemplate } from './Desktop';
import { MobileProfileTemplate } from './Mobile';
import { ProfileTab, type ProfileNavigationItem } from '@/client/types/core';
import type { User } from '@/common/types';
import { Cookbooks } from '@/client/components/organisms/Profile/Body/Cookbooks';
import { ProfileBodyInfo } from '@/client/components/organisms/Profile/Body/Info';
import { Recipes } from '@/client/components/organisms/Profile/Body/Recipes';
import { useRouter } from 'next/navigation';
import { GRID_COLS } from '@/client/constants';
import { useRunOnce } from '@/client/hooks';
import { t } from '@/client/locales';

type ProfileProps = Readonly<{
    initialTab?: ProfileTab | null;
    user: User;
}>;

export const ProfileTemplate: React.FC<ProfileProps> = ({
    user,
    initialTab = null
}) => {
    const router = useRouter();
    const { authResolved, user: currentUser } = useAuth();

    const isCurrentUser = authResolved && currentUser?.id === user.id;

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
                    isCurrentUser={isCurrentUser}
                    userId={user.id}
                />
            )
        },
        {
            param: ProfileTab.Cookbooks,
            label: t('app.profile.cookbooks'),
            content: (
                <Cookbooks isCurrentUser={isCurrentUser} userId={user.id} />
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
                user={user}
                isCurrentUser={isCurrentUser}
                initialTab={initialTab}
            />
            <MobileProfileTemplate
                className={'md:hidden'}
                items={profileNavigationItems}
                user={user}
                isCurrentUser={isCurrentUser}
            />
        </React.Fragment>
    );
};
