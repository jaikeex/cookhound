'use client';

import React, { Suspense, useCallback, useState } from 'react';
import {
    Avatar,
    ButtonBase,
    IconButton,
    IconLink,
    Logo,
    Popup,
    ThemeSwitcherIcon,
    Tooltip
} from '@/client/components';
import Link from 'next/link';
import { useAuth, useLocale } from '@/client/store';
import { Sidebar } from '@/client/components/molecules/Sidebar';
import { NavMenu } from './Menu';
import { TOP_NAVBAR_ID } from '@/client/constants';

type TopNavigationProps = Readonly<NonNullable<unknown>>;

export const TopNavigation: React.FC<TopNavigationProps> = () => {
    const { t } = useLocale();
    const { authResolved, user } = useAuth();

    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    const isLoggedin = authResolved && !!user;
    const avatarSrc = user ? (user.avatarUrl ?? 'default') : 'anonymous';

    const handleOpenSidebar = useCallback(() => setIsSidebarOpen(true), []);

    const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), []);

    const handleSearchClick = useCallback(() => {}, []);

    return (
        <div
            id={TOP_NAVBAR_ID}
            className="h-14 w-full flex items-center justify-between p-4 sticky top-0 z-20 bg-[#d1fae5] dark:bg-[#030712]"
        >
            <Link
                href={'/'}
                className="text-black dark:text-gray-100 hover:text-blue-800 dark:hover:text-blue-200"
            >
                <Logo className="logo-xs md:logo-sm" />
            </Link>

            {/* --------------------------------------- */}
            {/* ---------- MOBILE RIGHT SIDE ---------- */}
            {/* --------------------------------------- */}
            <div className="flex items-center md:hidden">
                <IconButton
                    icon="search"
                    size={28}
                    onClick={handleSearchClick}
                    className="flex items-center justify-center w-10 h-12"
                />

                <button
                    onClick={handleOpenSidebar}
                    className="flex items-center justify-center w-10 h-12"
                >
                    <Avatar src={avatarSrc || 'anonymous'} size="md" />
                </button>
            </div>

            {/* --------------------------------------- */}
            {/* ---------- DESKTOP RIGHT SIDE --------- */}
            {/* --------------------------------------- */}
            <div className="items-center hidden gap-3 md:flex">
                <React.Fragment>
                    <Tooltip
                        text={t('app.general.register-to-create-recipe')}
                        disabled={isLoggedin}
                    >
                        <Link href={'/recipe/create'}>
                            <ButtonBase
                                color="subtle"
                                icon="plus"
                                size="sm"
                                disabled={!isLoggedin || !authResolved}
                            >
                                {t('app.recipe.create')}
                            </ButtonBase>
                        </Link>
                    </Tooltip>

                    <Tooltip text={t('app.general.shopping-list-tooltip')}>
                        <IconLink href={'/shopping-list'} icon="shoppingList" />
                    </Tooltip>

                    <ThemeSwitcherIcon />

                    {/* --------------------------------------- */}
                    {/* ---------- DESKTOP USER MENU ---------- */}
                    {/* --------------------------------------- */}

                    <Popup content={<NavMenu user={user} className="w-56" />}>
                        <button>
                            <Avatar
                                alt={'Click to open user menu'}
                                src={avatarSrc || 'anonymous'}
                                size="md"
                                className={`${isLoggedin ? 'block' : authResolved ? 'hidden' : 'opacity-50 animate-pulse'}`}
                            />
                        </button>
                    </Popup>

                    <Link
                        href={'/auth/login'}
                        className={`${isLoggedin || !authResolved ? 'hidden' : 'block'}`}
                    >
                        <ButtonBase color="primary" size="sm">
                            {t('auth.form.login')}
                        </ButtonBase>
                    </Link>

                    <Link
                        href={'/auth/register'}
                        className={`${isLoggedin || !authResolved ? 'hidden' : 'block'}`}
                    >
                        <ButtonBase color="primary" size="sm">
                            {t('auth.form.register')}
                        </ButtonBase>
                    </Link>
                </React.Fragment>
            </div>

            {/* --------------------------------------- */}
            {/* ----------- MOBILE USER MENU ---------- */}
            {/* --------------------------------------- */}

            <Suspense fallback={null}>
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={handleCloseSidebar}
                    paramKey="menu"
                    position="right"
                    className="w-9/12 min-w-72"
                >
                    <NavMenu user={user} />
                </Sidebar>
            </Suspense>
        </div>
    );
};
