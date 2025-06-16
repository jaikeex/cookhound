'use client';

import React, { useCallback } from 'react';
import {
    Avatar,
    ButtonBase,
    Icon,
    IconButton,
    Logo,
    Popup,
    ThemeSwitcherIcon,
    Tooltip
} from '@/client/components';
import Link from 'next/link';
import { useAuth, useLocale } from '@/client/store';
import { useSidebar } from '@/client/components/molecules/Sidebar/useSidebar';
import { Sidebar } from '@/client/components/molecules/Sidebar';
import { NavMenu } from './Menu';

type TopNavigationProps = Readonly<NonNullable<unknown>>;

export const TopNavigation: React.FC<TopNavigationProps> = () => {
    const { t } = useLocale();
    const { authResolved, user } = useAuth();

    const isLoggedin = authResolved && !!user;
    const avatarSrc = user ? (user.avatarUrl ?? 'default') : 'anonymous';

    const { contentRef, toggleSidebar, ...rest } = useSidebar({
        paramKey: 'menu',
        useMobileParams: true,
        closeOnPathnameChange: true,
        enableOutsideClick: true
    });

    const handleSearchClick = useCallback(() => {}, []);

    return (
        <div className="h-12 md:h-14 w-full flex items-center justify-between p-4 sticky top-0 z-20 bg-[#d1fae5] dark:bg-[#030712]">
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
                    onClick={toggleSidebar}
                    className="flex items-center justify-center w-10 h-12"
                >
                    <Avatar src={avatarSrc || 'anonymous'} size="md" />
                </button>
            </div>

            {/* --------------------------------------- */}
            {/* ---------- DESKTOP RIGHT SIDE --------- */}
            {/* --------------------------------------- */}
            <div className="items-center hidden gap-3 md:flex ">
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
                                Create
                            </ButtonBase>
                        </Link>
                    </Tooltip>

                    <Icon name="bell" />

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

            <Sidebar {...rest} className="w-9/12 min-w-72">
                <NavMenu ref={contentRef} user={user} />
            </Sidebar>
        </div>
    );
};
