'use client';

import React, { useMemo } from 'react';
import { Menu, NavTabs, Typography, type MenuItem } from '@/client/components';
import { useLocale } from '@/client/store/I18nContext';

type AdminLayoutShellProps = Readonly<{
    children: React.ReactNode;
}>;

const NAV_ITEM_KEYS = [
    { href: '/admin', labelKey: 'admin.nav.dashboard' as const },
    { href: '/admin/users', labelKey: 'admin.nav.users' as const },
    {
        href: '/admin/api-docs',
        labelKey: 'admin.nav.apiDocs' as const
    }
] as const;

export const AdminLayoutShell: React.FC<AdminLayoutShellProps> = ({
    children
}) => {
    const { t } = useLocale();

    const menuItems: MenuItem[] = useMemo(
        () =>
            NAV_ITEM_KEYS.map((item) => ({
                href: item.href,
                label: t(item.labelKey)
            })),
        [t]
    );

    return (
        <div className="page-wrapper-wide flex flex-col md:flex-row gap-6 mt-8">
            <div className="w-full md:w-56 shrink-0">
                <Typography
                    variant="label"
                    className="hidden md:block uppercase tracking-wider text-secondary/60 px-4 pb-2"
                >
                    {t('admin.title')}
                </Typography>

                <Menu
                    items={menuItems}
                    aria-label="Admin navigation"
                    className="hidden md:flex"
                />
                <NavTabs
                    items={menuItems}
                    aria-label="Admin navigation"
                    className="md:hidden"
                />
            </div>

            <main className="flex-1 min-w-0">{children}</main>
        </div>
    );
};
