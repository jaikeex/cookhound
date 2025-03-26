'use client';

import React, { useCallback } from 'react';
import {
    Avatar,
    ButtonBase,
    Icon,
    IconButton,
    Logo,
    ThemeSwitcherIcon,
    Tooltip
} from '@/client/components';
import Link from 'next/link';
import { useLocale } from '@/client/store';

type NavbarProps = Readonly<{
    authResolved?: boolean;
    avatarSrc: string | null;
    isLoggedin?: boolean;
    onMenuToggle?: () => void;
}>;

export const Navbar: React.FC<NavbarProps> = ({
    authResolved,
    avatarSrc,
    isLoggedin,
    onMenuToggle
}) => {
    const { t } = useLocale();

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
            <div className="flex md:hidden items-center">
                <IconButton
                    icon="search"
                    size={28}
                    onClick={handleSearchClick}
                    className="w-10 h-12 flex justify-center items-center"
                />
                <button
                    onClick={onMenuToggle}
                    className="w-10 h-12 flex justify-center items-center"
                >
                    <Avatar src={avatarSrc || 'anonymous'} size="md" />
                </button>
            </div>

            {/* --------------------------------------- */}
            {/* ---------- DESKTOP RIGHT SIDE --------- */}
            {/* --------------------------------------- */}
            <div className="hidden md:flex items-center gap-3 ">
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

                    <button onClick={onMenuToggle}>
                        <Avatar
                            alt={'Click to open user menu'}
                            src={avatarSrc || 'anonymous'}
                            size="md"
                            className={`${isLoggedin ? 'block' : authResolved ? 'hidden' : 'opacity-50 animate-pulse'}`}
                        />
                    </button>

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
        </div>
    );
};
