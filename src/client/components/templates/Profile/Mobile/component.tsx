import React from 'react';
import type { ProfileNavigationItem, ProfileTab } from '@/client/types/core';
import type { TabContent } from '@/client/components/molecules/Tabs';
import { ProfileHeadMobile } from '@/client/components/organisms/Profile/Head/Mobile';
import { Tabs } from '@/client/components/molecules/Tabs';
import type { User } from '@/common/types';
import { classNames } from '@/client/utils';
import { resolveProfileTabIndex } from '@/client/components/templates/Profile/tabs';

export type MobileRecipeViewProps = Readonly<{
    className?: string;
    initialTab: ProfileTab;
    items: ProfileNavigationItem[];
    user: User;
    isCurrentUser: boolean;
}>;

export const MobileProfileTemplate: React.FC<MobileRecipeViewProps> = ({
    className,
    initialTab,
    items,
    user,
    isCurrentUser
}) => {
    const tabs: TabContent[] = items.map((item) => ({
        title: item.label,
        param: item.param,
        content: item.content
    }));

    /**
     * Mount on the tab the url asked for instead of on items[0]. Tabs syncs itself to the url on
     * mount either way, but not before the wrong tab's content has mounted and run its own
     * effects, which on a profile means the recipes tab requesting page one over http while the
     * server had already seeded the cookbooks tab for this render.
     */
    const initialTabIndex = resolveProfileTabIndex(items, initialTab);

    return (
        <article className={classNames(className)}>
            <ProfileHeadMobile user={user} isCurrentUser={isCurrentUser} />
            <Tabs
                tabs={tabs}
                activeTab={initialTabIndex}
                enableNavigation
                className="mt-4"
                buttonRowClassName="sticky top-14 z-10"
            />
        </article>
    );
};
