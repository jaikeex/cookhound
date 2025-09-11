import React from 'react';
import type { ProfileNavigationItem } from '@/client/types/core';
import type { TabContent } from '@/client/components';
import { ProfileHeadMobile, Tabs } from '@/client/components';
import type { UserDTO } from '@/common/types';
import { classNames } from '@/client/utils';

export type MobileRecipeViewProps = Readonly<{
    className?: string;
    items: ProfileNavigationItem[];
    user: UserDTO;
    isCurrentUser: boolean;
}>;

export const MobileProfileTemplate: React.FC<MobileRecipeViewProps> = ({
    className,
    items,
    user,
    isCurrentUser
}) => {
    const tabs: TabContent[] = items.map((item) => ({
        title: item.label,
        param: item.param,
        content: <div>{item.label}</div>
    }));

    return (
        <div className={classNames(className)}>
            <ProfileHeadMobile user={user} isCurrentUser={isCurrentUser} />
            <Tabs tabs={tabs} enableNavigation className="mt-4" />
        </div>
    );
};
