'use client';

import React, { Suspense, useMemo } from 'react';
import { Menu, type MenuItem } from '@/client/components/molecules/Menu';
import { NavTabs } from '@/client/components/molecules/NavTabs';
import { Typography } from '@/client/components/atoms/Typography';
import { ROUTES } from '@/common/constants';
import { t } from '@/client/locales';

type AdminLayoutShellProps = Readonly<{
    children: React.ReactNode;
}>;

const NAV_ITEM_KEYS = [
    { href: ROUTES.admin.root, labelKey: 'admin.nav.dashboard' as const },
    { href: ROUTES.admin.users, labelKey: 'admin.nav.users' as const },
    { href: ROUTES.admin.reports, labelKey: 'admin.nav.reports' as const },
    {
        href: ROUTES.admin.apiDocs,
        labelKey: 'admin.nav.apiDocs' as const
    }
] as const;

export const AdminLayoutShell: React.FC<AdminLayoutShellProps> = ({
    children
}) => {
    const menuItems: MenuItem[] = useMemo(
        () =>
            NAV_ITEM_KEYS.map((item) => ({
                href: item.href,
                label: t(item.labelKey)
            })),
        []
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

                <Suspense fallback={null}>
                    <Menu
                        items={menuItems}
                        aria-label="Admin navigation"
                        className="hidden md:flex"
                    />
                </Suspense>
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
