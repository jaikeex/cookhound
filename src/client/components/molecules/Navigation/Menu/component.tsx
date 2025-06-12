'use client';

import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { AnonymousMenuContent } from './Anonymous';
import { LoggedInMenuContent } from './LoggedIn';
import type { UserDTO } from '@/common/types';

type NavMenuProps = Readonly<{
    className?: string;
    ref?: React.Ref<HTMLDivElement>;
    user: UserDTO | null;
}>;

export const NavMenu: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<NavMenuProps> & React.RefAttributes<HTMLDivElement>
> = forwardRef<HTMLDivElement, NavMenuProps>(({ className, user }, ref) => {
    const isLoggedin = !!user;

    return (
        <div
            ref={ref}
            className={classNames(
                `fixed right-0 md:right-4 top-0 md:top-14 z-50 h-full w-9/12 md:w-72 md:h-auto px-8 py-16 md:py-6`,
                `md:rounded bg-sheet-200 dark:bg-sheet-800 shadow-[-4px_4px_15px_0_rgba(0,0,0,0.3)] dark:shadow-none`,
                className
            )}
        >
            {isLoggedin ? (
                <LoggedInMenuContent user={user} />
            ) : (
                <AnonymousMenuContent />
            )}
        </div>
    );
});
