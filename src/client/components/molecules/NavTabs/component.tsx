'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { classNames } from '@/client/utils';
import { Typography } from '@/client/components';
import type { MenuItem } from '@/client/components';

export type NavTabsProps = Readonly<{
    buttonRowClassName?: string;
    className?: string;
    items: readonly MenuItem[];
}> &
    React.ComponentProps<'nav'>;

export const NavTabs: React.FC<NavTabsProps> = ({
    buttonRowClassName,
    className,
    items,
    ...props
}) => {
    const pathname = usePathname();

    const tabWidth = 100 / items.length;

    const activeIndex = useMemo(() => {
        // Prefer an exact pathname match over a child-route match
        const exactIndex = items.findIndex(
            (item) => pathname === new URL(item.href, 'http://n').pathname
        );

        if (exactIndex !== -1) return exactIndex;

        // Fall back to longest child-route prefix match
        const childIndex = items.findIndex((item) => {
            const hrefPathname = new URL(item.href, 'http://n').pathname;
            return (
                hrefPathname !== '/' && pathname.startsWith(`${hrefPathname}/`)
            );
        });

        return childIndex === -1 ? 0 : childIndex;
    }, [items, pathname]);

    return (
        <nav
            aria-label="Section navigation"
            className={classNames(className)}
            {...props}
        >
            <div
                className={classNames(
                    'relative flex flex-row items-center w-full rounded-md',
                    'bg-gray-200 dark:bg-gray-800',
                    buttonRowClassName
                )}
            >
                {items.map((item, index) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        prefetch={false}
                        aria-current={
                            activeIndex === index ? 'page' : undefined
                        }
                        className="z-10 px-4 py-2 rounded-xs cursor-pointer whitespace-nowrap text-center"
                        style={{ width: `${tabWidth}%` }}
                    >
                        <Typography
                            variant="label"
                            className={
                                activeIndex === index
                                    ? 'text-black dark:text-white'
                                    : 'text-slate-600 dark:text-gray-400'
                            }
                        >
                            {item.label}
                        </Typography>
                    </Link>
                ))}

                <div
                    className={classNames(
                        'absolute w-1/3 h-full bg-blue-600 rounded-md opacity-20',
                        'transition-transform duration-200 ease-in-out',
                        'top-0 z-0 pointer-events-none'
                    )}
                    style={{
                        width: `${tabWidth}%`,
                        transform: `translateX(${activeIndex * 100}%)`
                    }}
                />
            </div>
        </nav>
    );
};
