'use client';

import React from 'react';
import classnames from 'classnames';
import { Icon, Tooltip } from '@/client/components';
import Link from 'next/link';
import { useAuth, useLocale } from '@/client/store';
import { BOTTOM_NAVBAR_ID } from '@/client/constants';

type BottomNavigationProps = Readonly<NonNullable<unknown>>;

export const BottomNavigation: React.FC<BottomNavigationProps> = () => {
    const { authResolved, user } = useAuth();
    const { t } = useLocale();

    const isLoggedin = authResolved && !!user;

    return (
        <div
            id={BOTTOM_NAVBAR_ID}
            className={classnames(
                `block md:hidden sticky bottom-0 left-0 h-14 px-2 py-4 bg-[#f0fdf4] dark:bg-[#021812]`,
                `flex [&>*]:w-full items-center justify-between border-t border-gray-300 dark:border-gray-800`
            )}
        >
            <Link href={'/'}>
                <Icon name="home" label={t('app.general.home')} />
            </Link>
            <Link
                href={'/'}
                tabIndex={isLoggedin ? 0 : -1}
                className={classnames(!isLoggedin && 'link-disabled')}
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
                    tabIndex={isLoggedin ? 0 : -1}
                    className={classnames(!isLoggedin && 'link-disabled')}
                >
                    <Icon
                        name="plus"
                        label={t('app.recipe.create-short')}
                        disabled={!isLoggedin}
                    />
                </Link>
            </Tooltip>

            <Link
                href={'/shopping-list'}
                tabIndex={isLoggedin ? 0 : -1}
                className={classnames(!isLoggedin && 'link-disabled')}
            >
                <Icon
                    name="shoppingList"
                    label={t('app.general.shopping-list')}
                    disabled={!isLoggedin}
                />
            </Link>
        </div>
    );
};
