'use client';

import React from 'react';
import { AnonymousMenuContent } from './Anonymous';
import { LoggedInMenuContent } from './LoggedIn';
import type { UserDTO } from '@/common/types';

type NavMenuProps = Readonly<{
    className?: string;
    ref?: React.Ref<HTMLDivElement>;
    user: UserDTO | null;
}>;

export const NavMenu: React.FC<NavMenuProps> = ({ className, ref, user }) => {
    const isLoggedin = !!user;

    return (
        <div ref={ref} className={className}>
            {isLoggedin ? (
                <LoggedInMenuContent user={user} />
            ) : (
                <AnonymousMenuContent />
            )}
        </div>
    );
};
