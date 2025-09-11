'use client';

import { useLocale } from '@/client/store';
import React, { use } from 'react';
import { DesktopProfileTemplate } from './Desktop';
import { MobileProfileTemplate } from './Mobile';
import type { ProfileNavigationItem } from '@/client/types/core';
import type { UserDTO } from '@/common/types';

type ProfileProps = Readonly<{
    user: Promise<UserDTO>;
}>;

export const ProfileTemplate: React.FC<ProfileProps> = ({ user }) => {
    const userResolved = use(user);
    const { t } = useLocale();

    console.log(userResolved);

    const profileNavigationItems: ProfileNavigationItem[] = [
        { param: `dashboard`, label: t('app.profile.dashboard') },
        { param: `recipes`, label: t('app.profile.recipes') },
        { param: `cookbooks`, label: t('app.profile.cookbooks') }
    ];

    return (
        <React.Fragment>
            <DesktopProfileTemplate
                className={'hidden md:block'}
                items={profileNavigationItems}
            />
            <MobileProfileTemplate
                className={'md:hidden'}
                items={profileNavigationItems}
            />
        </React.Fragment>
    );
};
