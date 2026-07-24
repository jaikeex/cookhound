'use client';

import React, { useState } from 'react';
import { type ProfileNavigationItem, ProfileTab } from '@/client/types/core';
import { Menu } from '@/client/components/molecules/Menu';
import { useParams, useSearchParams } from 'next/navigation';
import type { User } from '@/common/types';
import { classNames } from '@/client/utils';
import { ProfileHeadDesktop } from '@/client/components/organisms/Profile/Head/Desktop';
import { useParamsChangeListener } from '@/client/hooks';
import { ROUTES } from '@/common/constants';

export type DesktopRecipeViewProps = Readonly<{
    className?: string;
    items: ProfileNavigationItem[];
    user: User;
    isCurrentUser: boolean;
    initialTab?: ProfileTab | null;
}>;

export const DesktopProfileTemplate: React.FC<DesktopRecipeViewProps> = ({
    className,
    items,
    user,
    isCurrentUser,
    initialTab = ProfileTab.Dashboard
}) => {
    const { id } = useParams();
    const searchParams = useSearchParams();

    const [tab, setTab] = useState<ProfileTab>(
        initialTab ?? ProfileTab.Dashboard
    );

    useParamsChangeListener({
        key: 'tab',
        onChange: () => {
            setTab(searchParams.get('tab') as ProfileTab);
        }
    });

    const menuItems = items.map((item) => ({
        href: `${ROUTES.user.detail(String(id))}?tab=${item.param}`,
        label: item.label
    }));

    return (
        <article className={classNames('page-wrapper gap-4 px-4', className)}>
            <ProfileHeadDesktop user={user} isCurrentUser={isCurrentUser} />
            <div className="grid grid-cols-4 gap-12 mt-10">
                <Menu items={menuItems} className="col-span-1" />
                <div className="col-span-3">
                    {items.find((item) => item.param === tab)?.content}
                </div>
            </div>
        </article>
    );
};
