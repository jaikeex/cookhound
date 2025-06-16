'use client';

import React from 'react';
import classnames from 'classnames';
import { Icon, Tooltip } from '@/client/components';
import Link from 'next/link';
import { useAuth, useLocale } from '@/client/store';

type BottomNavigationProps = Readonly<NonNullable<unknown>>;

export const BottomNavigation: React.FC<BottomNavigationProps> = () => {
    const { authResolved, user } = useAuth();
    const { t } = useLocale();

    const isLoggedin = authResolved && !!user;

    return (
        <div
            className={classnames(
                `block md:hidden fixed bottom-0 right-0 left-0 h-14 px-2 py-4 bg-[#f0fdf4] dark:bg-[#021812]`,
                `flex [&>*]:w-full items-center justify-between border-t border-gray-300 dark:border-gray-800`
            )}
        >
            <Link href={'/'}>
                <Icon name="home" label="Home" />
            </Link>
            <Link
                href={'/'}
                tabIndex={isLoggedin ? 0 : -1}
                className={classnames(!isLoggedin && 'link-disabled')}
            >
                <Icon name="book" label="Cookbooks" disabled={!isLoggedin} />
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
                    <Icon name="plus" label="Create" disabled={!isLoggedin} />
                </Link>
            </Tooltip>

            <Link
                href={'/'}
                tabIndex={isLoggedin ? 0 : -1}
                className={classnames(!isLoggedin && 'link-disabled')}
            >
                <Icon
                    name="bell"
                    label="Notifications"
                    disabled={!isLoggedin}
                />
            </Link>
        </div>
    );
};
