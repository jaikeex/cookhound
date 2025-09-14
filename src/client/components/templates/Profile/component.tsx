'use client';

import { useAuth, useLocale } from '@/client/store';
import React, { use, useEffect } from 'react';
import { DesktopProfileTemplate } from './Desktop';
import { MobileProfileTemplate } from './Mobile';
import { ProfileTab, type ProfileNavigationItem } from '@/client/types/core';
import type { UserDTO } from '@/common/types';
import { Recipes } from '@/client/components';
import { ComingSoon } from '@/client/components';
import { useRouter, useSearchParams } from 'next/navigation';
import { GRID_COLS } from '@/client/constants';

type ProfileProps = Readonly<{
    user: Promise<UserDTO>;
}>;

export const ProfileTemplate: React.FC<ProfileProps> = ({ user }) => {
    const userResolved = use(user);
    const searchParams = useSearchParams();
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
                      content: null
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
                    recipes={[]}
                    userId={userResolved.id}
                />
            )
        },
        {
            param: ProfileTab.Cookbooks,
            label: t('app.profile.cookbooks'),
            content: <ComingSoon className="max-w-96" />
        }
    ];

    useEffect(() => {
        const tab = searchParams.get('tab');
        const currentUrl = new URL(window.location.href);

        /**
         * If the URL doesn't have a tab, set it to the default tab.
         */
        if (!tab) {
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
        if (tab === ProfileTab.Dashboard && !isCurrentUser) {
            router.replace('/user/recipes', {
                scroll: false
            });

            currentUrl.searchParams.set('tab', ProfileTab.Recipes);

            router.replace(currentUrl.pathname + currentUrl.search, {
                scroll: false
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <React.Fragment>
            <DesktopProfileTemplate
                className={'hidden md:block'}
                items={profileNavigationItems}
                user={userResolved}
                isCurrentUser={isCurrentUser}
            />
            <MobileProfileTemplate
                className={'md:hidden'}
                items={profileNavigationItems}
                user={userResolved}
                isCurrentUser={isCurrentUser}
            />
        </React.Fragment>
    );
};
