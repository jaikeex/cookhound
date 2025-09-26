'use client';

import React, { useState } from 'react';
import { classNames } from '@/client/utils';
import { Icon, Tooltip } from '@/client/components';
import Link from 'next/link';
import { useAuth, useLocale } from '@/client/store';
import { BOTTOM_NAVBAR_ID } from '@/client/constants';
import { usePathname } from 'next/navigation';
import { AppEvent } from '@/client/events';
import { useAppEventListener } from '@/client/hooks';

const DISABLED_FOR_ROUTES = ['/recipe/create'];

/**
 * Check if the current pathname should disable the bottom navigation
 *
 * @param pathname - Current pathname
 * @returns true if navigation should be disabled
 */
const isNavigationDisabled = (pathname: string): boolean => {
    if (DISABLED_FOR_ROUTES.includes(pathname)) {
        return true;
    }

    if (pathname.match(/^\/recipe\/[^/]+\/edit$/)) {
        return true;
    }

    return false;
};

type BottomNavigationProps = Readonly<NonNullable<unknown>>;

export const BottomNavigation: React.FC<BottomNavigationProps> = () => {
    const { authResolved, user } = useAuth();
    const { t } = useLocale();
    const pathname = usePathname();

    const [isNotfound, setIsNotfound] = useState<boolean>(false);

    const isLoggedin = authResolved && !!user;

    const isDisabled = isNavigationDisabled(pathname);

    useAppEventListener(AppEvent.NOT_FOUND_OPENED, () => setIsNotfound(true));
    useAppEventListener(AppEvent.NOT_FOUND_CLOSED, () => setIsNotfound(false));

    if (!authResolved || isDisabled || isNotfound) return null;

    return (
        <div
            id={BOTTOM_NAVBAR_ID}
            className={classNames(
                `block md:hidden z-20 fixed bottom-0 left-0 right-0 h-14 px-2 py-4 bg-[#f0fdf4] dark:bg-[#021812]`,
                `flex [&>*]:w-full items-center justify-between border-t border-gray-300 dark:border-gray-800`,
                isNotfound ? 'hidden' : ''
            )}
        >
            <Link href={'/'} aria-label={t('app.general.home')}>
                <Icon name="home" label={t('app.general.home')} />
            </Link>
            <Link
                href={`/user/${user?.id}?tab=cookbooks`}
                aria-label={t('app.general.cookbooks')}
                tabIndex={isLoggedin ? 0 : -1}
                className={classNames(!isLoggedin && 'link-disabled')}
            >
                <Icon
                    name="book"
                    label={t('app.general.cookbooks')}
                    disabled={!isLoggedin}
                />
            </Link>

            <Tooltip
                text={t('app.general.register-to-create-recipe')}
                disabled={isLoggedin}
                position={'top'}
            >
                <Link
                    href={'/recipe/create'}
                    aria-label={t('app.recipe.create')}
                    prefetch={isLoggedin}
                    tabIndex={isLoggedin ? 0 : -1}
                    className={classNames(!isLoggedin && 'link-disabled')}
                >
                    <Icon
                        name="plus"
                        label={t('app.recipe.create-short')}
                        disabled={!isLoggedin}
                    />
                </Link>
            </Tooltip>

            <Tooltip
                text={t('app.general.register-to-use-shopping-list')}
                disabled={isLoggedin}
                position={'top-end'}
            >
                <Link
                    href={'/shopping-list'}
                    aria-label={t('app.general.shopping-list')}
                    prefetch={isLoggedin}
                    tabIndex={isLoggedin ? 0 : -1}
                    className={classNames(!isLoggedin && 'link-disabled')}
                >
                    <Icon
                        name="shoppingList"
                        label={t('app.general.shopping-list')}
                        disabled={!isLoggedin}
                    />
                </Link>
            </Tooltip>
        </div>
    );
};
