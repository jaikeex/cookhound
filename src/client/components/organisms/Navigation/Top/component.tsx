'use client';

import React from 'react';
import { Navbar } from '@/client/components';
import { useAuth } from '@/client/store';
import { NavMenu } from '@/client/components/molecules/Navigation/Menu';
import { useNavigationMenu } from './hooks';

type TopNavigationProps = Readonly<NonNullable<unknown>>;

export const TopNavigation: React.FC<TopNavigationProps> = () => {
    const { authResolved, user } = useAuth();
    const { isMenuOpen, menuRef, menuClass, backdropClass, toggleMenu } =
        useNavigationMenu();

    const isLoggedin = authResolved && !!user;
    const avatarSrc = user ? (user.avatarUrl ?? 'default') : 'anonymous';

    return (
        <React.Fragment>
            <Navbar
                authResolved={authResolved}
                isLoggedin={isLoggedin}
                avatarSrc={avatarSrc}
                onMenuToggle={toggleMenu}
            />

            {isMenuOpen ? (
                <>
                    <div
                        className={`block md:hidden fixed h-screen w-screen inset-0 bg-black bg-opacity-75 z-20 ${backdropClass}`}
                    />
                    <NavMenu ref={menuRef} className={menuClass} user={user} />
                </>
            ) : null}
        </React.Fragment>
    );
};
