'use client';

import React, { useCallback, useState } from 'react';
import { classNames } from '@/client/utils';
import { Icon } from '@/client/components/atoms/Icons';
import Link from 'next/link';
import { useAuth, useSnackbar } from '@/client/store';
import { BOTTOM_NAVBAR_ID } from '@/client/constants';
import { t } from '@/client/locales';
import { usePathname } from 'next/navigation';
import { AppEvent } from '@/client/events';
import { useAppEventListener } from '@/client/hooks';
import { BottomNavigationSkeleton } from './skeleton';
import { ROUTES } from '@/common/constants';

const DISABLED_FOR_ROUTES: string[] = [ROUTES.recipe.create];

const RECIPE_EDIT_ROUTE_PATTERN = new RegExp(
    `^${ROUTES.recipe.detail('[^/]+')}/edit$`
);

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

    if (RECIPE_EDIT_ROUTE_PATTERN.test(pathname)) {
        return true;
    }

    return false;
};

type BottomNavigationProps = Readonly<NonNullable<unknown>>;

export const BottomNavigation: React.FC<BottomNavigationProps> = () => {
    const { authResolved, user } = useAuth();
    const { alert } = useSnackbar();
    const pathname = usePathname();

    const [isNotfound, setIsNotfound] = useState<boolean>(false);

    const isLoggedin = authResolved && !!user;

    const isDisabled = isNavigationDisabled(pathname);

    const showLoginPrompt = useCallback(
        (message: string, returnTarget: string) =>
            alert({
                message,
                variant: 'info',
                position: 'bottom',
                action: {
                    label: t('auth.form.login'),
                    href: ROUTES.auth.loginReturningTo(returnTarget)
                }
            }),
        [alert]
    );

    const handleLockedCookbooks = useCallback(
        () =>
            showLoginPrompt(
                t('app.general.register-to-use-cookbooks'),
                `${window.location.pathname}${window.location.search}`
            ),
        [showLoginPrompt]
    );

    const handleLockedCreateRecipe = useCallback(
        () =>
            showLoginPrompt(
                t('app.general.register-to-create-recipe'),
                ROUTES.recipe.create
            ),
        [showLoginPrompt]
    );

    const handleLockedShoppingList = useCallback(
        () =>
            showLoginPrompt(
                t('app.general.register-to-use-shopping-list'),
                ROUTES.shoppingList
            ),
        [showLoginPrompt]
    );

    useAppEventListener(AppEvent.NOT_FOUND_OPENED, () => setIsNotfound(true));
    useAppEventListener(AppEvent.NOT_FOUND_CLOSED, () => setIsNotfound(false));

    if (isDisabled || isNotfound) return null;

    if (!authResolved) {
        return <BottomNavigationSkeleton />;
    }

    return (
        <div
            id={BOTTOM_NAVBAR_ID}
            className={classNames(
                `block md:hidden z-20 fixed bottom-0 left-0 right-0 h-14 px-2 py-4 bg-[#f0fdf4] dark:bg-[#021812]`,
                `flex *:w-full items-center justify-between border-t border-gray-300 dark:border-gray-800`
            )}
        >
            <Link href={ROUTES.home} aria-label={t('app.general.home')}>
                <Icon name="home" label={t('app.general.home')} />
            </Link>

            {isLoggedin ? (
                <Link
                    href={`${ROUTES.user.detail(user.id)}?tab=cookbooks`}
                    aria-label={t('app.general.cookbooks')}
                >
                    <Icon name="book" label={t('app.general.cookbooks')} />
                </Link>
            ) : (
                <button
                    type="button"
                    aria-label={t('app.general.cookbooks')}
                    onClick={handleLockedCookbooks}
                >
                    <Icon
                        name="book"
                        label={t('app.general.cookbooks')}
                        disabled
                    />
                </button>
            )}

            {isLoggedin ? (
                <Link
                    href={ROUTES.recipe.create}
                    aria-label={t('app.recipe.create')}
                >
                    <Icon name="plus" label={t('app.recipe.create-short')} />
                </Link>
            ) : (
                <button
                    type="button"
                    aria-label={t('app.recipe.create')}
                    onClick={handleLockedCreateRecipe}
                >
                    <Icon
                        name="plus"
                        label={t('app.recipe.create-short')}
                        disabled
                    />
                </button>
            )}

            {isLoggedin ? (
                <Link
                    href={ROUTES.shoppingList}
                    aria-label={t('app.general.shopping-list')}
                >
                    <Icon
                        name="shoppingList"
                        label={t('app.general.shopping-list')}
                    />
                </Link>
            ) : (
                <button
                    type="button"
                    aria-label={t('app.general.shopping-list')}
                    onClick={handleLockedShoppingList}
                >
                    <Icon
                        name="shoppingList"
                        label={t('app.general.shopping-list')}
                        disabled
                    />
                </button>
            )}
        </div>
    );
};
