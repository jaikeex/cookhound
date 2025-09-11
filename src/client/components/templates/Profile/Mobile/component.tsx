import React from 'react';
import type { ProfileNavigationItem } from '@/client/types/core';
import type { TabContent } from '@/client/components';
import { Tabs } from '@/client/components';

export type MobileRecipeViewProps = Readonly<{
    className?: string;
    items: ProfileNavigationItem[];
}>;

export const MobileProfileTemplate: React.FC<MobileRecipeViewProps> = ({
    className,
    items
}) => {
    const tabs: TabContent[] = items.map((item) => ({
        title: item.label,
        param: item.param,
        content: <div>{item.label}</div>
    }));

    return (
        <div className={className}>
            <Tabs tabs={tabs} enableNavigation />
        </div>
    );
};
