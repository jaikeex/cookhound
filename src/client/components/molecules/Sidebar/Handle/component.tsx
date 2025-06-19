'use client';

import React, { useMemo } from 'react';
import classNames from 'classnames';
import { Icon, Typography } from '@/client/components/atoms';
import { useCheckScrollExistence } from '@/client/hooks';

type SidebarHandleProps = Readonly<{
    className?: string;
    onClick: () => void;
    isOpen: boolean;
    position: 'left' | 'right' | 'top' | 'bottom';
    sidebarDimensions: { width: number; height: number };
    label?: string;
}> &
    React.PropsWithChildren;

const iconNames = {
    right: { closed: 'chevronDoubleUp', open: 'chevronDoubleDown' },
    left: { closed: 'chevronDoubleUp', open: 'chevronDoubleDown' },
    top: { closed: 'chevronDoubleDown', open: 'chevronDoubleUp' },
    bottom: { closed: 'chevronDoubleUp', open: 'chevronDoubleDown' }
} as const;

export const SidebarHandle: React.FC<SidebarHandleProps> = ({
    className,
    onClick,
    isOpen,
    position = 'right',
    sidebarDimensions,
    label = 'SIDEBAR'
}) => {
    const {
        doesScrollbarExist,
        scrollbarWidth,
        topNavbarHeight,
        bottomNavbarHeight
    } = useCheckScrollExistence();

    const styles = useMemo(() => {
        switch (position) {
            case 'right':
                return {
                    right: '0px',
                    top: '50%',
                    marginRight:
                        doesScrollbarExist && !isOpen
                            ? scrollbarWidth + 20
                            : 20,
                    transformOrigin: 'right center',
                    transition: 'transform 0.3s ease-in-out',
                    transform: isOpen
                        ? `translateY(-50%) translateX(-${sidebarDimensions.width}px)`
                        : 'translateY(-50%) translateX(50%)'
                };
            case 'left':
                return {
                    left: '0px',
                    top: '50%',
                    marginLeft:
                        doesScrollbarExist && !isOpen
                            ? scrollbarWidth + 20
                            : 20,
                    transformOrigin: 'left center',
                    transition: 'transform 0.3s ease-in-out',
                    transform: isOpen
                        ? `translateY(-50%) translateX(${sidebarDimensions.width}px)`
                        : 'translateY(-50%) translateX(0px)'
                };
            case 'top':
                return {
                    top: isOpen ? 0 : topNavbarHeight,
                    left: '50%',
                    marginTop: 20,
                    transformOrigin: 'center top',
                    transition: 'transform 0.3s ease-in-out',
                    transform: isOpen
                        ? `translateX(-50%) translateY(${sidebarDimensions.height}px)`
                        : 'translateX(-50%) translateY(0px)'
                };
            case 'bottom':
                return {
                    bottom: isOpen ? 0 : bottomNavbarHeight,
                    left: '50%',
                    marginBottom: 20,
                    transformOrigin: 'center bottom',
                    transition: 'transform 0.3s ease-in-out',
                    transform: isOpen
                        ? `translateX(-50%) translateY(-${sidebarDimensions.height}px)`
                        : 'translateX(-50%) translateY(0px)'
                };
        }
    }, [
        position,
        doesScrollbarExist,
        isOpen,
        scrollbarWidth,
        sidebarDimensions.width,
        sidebarDimensions.height,
        topNavbarHeight,
        bottomNavbarHeight
    ]);

    return (
        <div
            className={classNames(
                ' w-0 h-0 transition-all duration-300 ease-in-out fixed cursor-pointer',
                'flex items-center justify-center',
                isOpen ? 'z-30' : 'z-10',
                className
            )}
            style={styles}
            onClick={onClick}
            tabIndex={0}
        >
            <div
                className={classNames(
                    'px-4 py-1 h-10 flex items-center justify-center transition-all duration-100',
                    isOpen
                        ? 'bg-sheet-200 hover:bg-sheet-300 dark:bg-sheet-800 dark:hover:bg-sheet-700'
                        : 'bg-sky-200 hover:bg-sky-300 dark:bg-sky-900 dark:hover:bg-sky-800',
                    position === 'top' ? 'rounded-b-lg' : 'rounded-t-lg',
                    position === 'left' && 'rotate-90',
                    position === 'right' && '-rotate-90'
                )}
            >
                <Icon
                    name={
                        isOpen
                            ? iconNames[position].open
                            : iconNames[position].closed
                    }
                />
                <Typography
                    variant="heading-sm"
                    className={`tracking-wider font-normal px-4`}
                >
                    {label}
                </Typography>
                <Icon
                    name={
                        isOpen
                            ? iconNames[position].open
                            : iconNames[position].closed
                    }
                />
            </div>
        </div>
    );
};
