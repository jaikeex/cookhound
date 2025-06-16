'use client';

import classNames from 'classnames';
import React from 'react';

type SidebarProps = Readonly<{
    className?: string;
    isSidebarOpen: boolean;
    backdropClass: string;
    containerClassName: string;
}> &
    React.PropsWithChildren;

export const Sidebar: React.FC<SidebarProps> = ({
    children,
    className,
    isSidebarOpen,
    backdropClass,
    containerClassName
}) => {
    return isSidebarOpen ? (
        <React.Fragment>
            <div
                className={`block md:hidden fixed h-screen w-screen inset-0 bg-black bg-opacity-75 z-20 ${backdropClass}`}
            />
            <div
                className={classNames(
                    'z-50 px-8 py-16 sheet',
                    containerClassName,
                    className
                )}
            >
                {children}
            </div>
        </React.Fragment>
    ) : null;
};
