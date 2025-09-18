'use client';

import React, { useState } from 'react';
import { type ProfileNavigationItem, ProfileTab } from '@/client/types/core';
import { Menu } from '@/client/components/molecules';
import { useParams, useSearchParams } from 'next/navigation';
import type { UserDTO } from '@/common/types';
import { classNames } from '@/client/utils';
import { ProfileHeadDesktop } from '@/client/components/organisms/Profile/Head/Desktop';
import { useParamsChangeListener } from '@/client/hooks';

export type DesktopRecipeViewProps = Readonly<{
    className?: string;
    items: ProfileNavigationItem[];
    user: UserDTO;
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
        href: `/user/${id}?tab=${item.param}`,
        label: item.label
    }));

    return (
        <div className={classNames('page-wrapper gap-4 px-4', className)}>
            <ProfileHeadDesktop user={user} isCurrentUser={isCurrentUser} />
            <div className="grid grid-cols-4 gap-12 mt-10">
                <Menu items={menuItems} className="col-span-1" />
                <div className="col-span-3">
                    {items.find((item) => item.param === tab)?.content}
                </div>
            </div>
        </div>
    );
};
