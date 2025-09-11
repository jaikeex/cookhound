import React from 'react';
import type { ProfileNavigationItem } from '@/client/types/core';
import { Menu } from '@/client/components/molecules';
import { useParams } from 'next/navigation';

export type DesktopRecipeViewProps = Readonly<{
    className?: string;
    items: ProfileNavigationItem[];
}>;

export const DesktopProfileTemplate: React.FC<DesktopRecipeViewProps> = ({
    className,
    items
}) => {
    const { id } = useParams();

    const menuItems = items.map((item) => ({
        href: `/user/${id}?tab=${item.param}`,
        label: item.label
    }));

    return (
        <div className={className}>
            <Menu items={menuItems} />
        </div>
    );
};
