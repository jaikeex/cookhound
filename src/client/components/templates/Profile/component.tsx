'use client';

import { useAuth, useLocale } from '@/client/store';
import React, { use } from 'react';
import { DesktopProfileTemplate } from './Desktop';
import { MobileProfileTemplate } from './Mobile';
import type { ProfileNavigationItem } from '@/client/types/core';
import type { UserDTO } from '@/common/types';
import { Recipes } from '@/client/components';

type ProfileProps = Readonly<{
    user: Promise<UserDTO>;
}>;

export const ProfileTemplate: React.FC<ProfileProps> = ({ user }) => {
    const userResolved = use(user);

    const { t } = useLocale();
    const { authResolved, user: currentUser } = useAuth();

    const isCurrentUser = authResolved && currentUser?.id === userResolved.id;

    const profileNavigationItems: ProfileNavigationItem[] = [
        ...(isCurrentUser
            ? [
                  {
                      param: `dashboard`,
                      label: t('app.profile.dashboard'),
                      content: null
                  }
              ]
            : []),

        {
            param: `recipes`,
            label: t('app.profile.recipes'),
            content: (
                <Recipes
                    isCurrentUser={isCurrentUser}
                    recipes={[]}
                    userId={userResolved.id}
                />
            )
        },
        {
            param: `cookbooks`,
            label: t('app.profile.cookbooks'),
            content: null
        }
    ];

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
