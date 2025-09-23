'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { classNames } from '@/client/utils';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';

export type MenuItem = Readonly<{
    href: string;
    label: string;
}>;

export type MenuProps = Readonly<{
    className?: string;
    items: readonly MenuItem[];
}> &
    React.ComponentProps<'nav'>;

export const Menu: React.FC<MenuProps> = ({ className, items, ...props }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const menuItems = items.map(({ href, label }) => {
        const hrefUrl = new URL(href, ENV_CONFIG_PUBLIC.ORIGIN);
        const hrefPathname = hrefUrl.pathname;
        const hrefSearchParams = hrefUrl.searchParams;

        // There is 1456432 better ways to do this, but this is the simplest one.
        const NON_NAVIGATIONAL_PARAMS = ['modal', 'sidebar-open'];
        const filteredSearchParams = new URLSearchParams();

        for (const [key, value] of searchParams.entries()) {
            if (!NON_NAVIGATIONAL_PARAMS.includes(key)) {
                filteredSearchParams.set(key, value);
            }
        }

        const currentUrl = `${pathname}${filteredSearchParams.toString() ? `?${filteredSearchParams.toString()}` : ''}`;

        /**
         * Consider a path active if:
         * 1. The full URL (pathname + navigational query params) matches exactly, OR
         * 2. The pathname matches exactly and href has no query params, OR
         * 3. The current path is a child route of the href path (for nested routes) and href has no query params
         */
        const isExactUrlMatch = currentUrl === href;
        const hasNoQueryParams = hrefSearchParams.toString() === '';
        const isExactPathnameMatch = pathname === hrefPathname;
        const isChildRoute =
            hrefPathname !== '/' && pathname.startsWith(`${hrefPathname}/`);

        const isActive =
            isExactUrlMatch ||
            (hasNoQueryParams && (isExactPathnameMatch || isChildRoute));

        return (
            <li key={href} className="my-0.5">
                <Link
                    href={href}
                    aria-label={label}
                    aria-current={isActive ? 'page' : undefined}
                    prefetch={false}
                    className={classNames(
                        'block rounded px-4 py-2 transition-colors',
                        isActive
                            ? 'bg-green-200 text-green-900 dark:bg-gray-800 dark:text-gray-50 font-semibold'
                            : 'text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900'
                    )}
                >
                    {label}
                </Link>
            </li>
        );
    });

    return (
        <nav
            aria-label="Section navigation"
            className={classNames('flex flex-col', className)}
            {...props}
        >
            <ul>{menuItems}</ul>
        </nav>
    );
};

export default Menu;
