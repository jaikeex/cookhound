'use client';

import React, { useState } from 'react';
import { type ProfileNavigationItem, ProfileTab } from '@/client/types/core';
import { Menu } from '@/client/components/molecules';
import { useParams, useSearchParams } from 'next/navigation';
import type { UserDTO } from '@/common/types';
import { classNames } from '@/client/utils';
import { ProfileHeadDesktop } from '@/client/components/organisms/Profile/Head/Desktop';
import { Divider } from '@/client/components';
import { useParamsChangeListener } from '@/client/hooks';

export type DesktopRecipeViewProps = Readonly<{
    className?: string;
    items: ProfileNavigationItem[];
    user: UserDTO;
    isCurrentUser: boolean;
}>;

export const DesktopProfileTemplate: React.FC<DesktopRecipeViewProps> = ({
    className,
    items,
    user,
    isCurrentUser
}) => {
    const { id } = useParams();
    const searchParams = useSearchParams();

    const [tab, setTab] = useState<ProfileTab>(ProfileTab.Dashboard);

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
        <div
            className={classNames(
                'max-w-screen-sm gap-4 px-4 mx-auto md:max-w-screen-md lg:max-w-screen-lg',
                className
            )}
        >
            <ProfileHeadDesktop user={user} isCurrentUser={isCurrentUser} />
            <Divider className="mt-4 mb-2" />

            <div className="grid grid-cols-4 gap-4">
                <Menu items={menuItems} className="col-span-1" />
                <div className="col-span-3">
                    {items.find((item) => item.param === tab)?.content}
                </div>
            </div>
        </div>
    );
};
