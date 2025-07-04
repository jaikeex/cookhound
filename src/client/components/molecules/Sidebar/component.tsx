'use client';

import { classNames } from '@/client/utils';
import React, { useEffect, useRef, useCallback } from 'react';
import { useSidebar } from './useSidebar';
import { IconButton } from '@/client/components/atoms';

type SidebarProps = Readonly<{
    className?: string;
    closeOnPathnameChange?: boolean;
    enableOutsideClick?: boolean;
    hidden?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
    paramKey?: string;
    position?: 'left' | 'right' | 'top' | 'bottom';
    useMobileParams?: boolean;
}> &
    React.PropsWithChildren;

const closeIconPositionClass = {
    left: 'right-3 top-3',
    right: 'left-3 top-3',
    top: 'right-3 bottom-3',
    bottom: 'right-3 top-3'
};

export const Sidebar: React.FC<SidebarProps> = ({
    children,
    className,
    closeOnPathnameChange = true,
    enableOutsideClick = true,
    hidden = false,
    isOpen,
    onClose,
    paramKey,
    position = 'right',
    useMobileParams = true
}) => {
    const {
        contentRef,
        toggleSidebar,
        isSidebarOpen,
        backdropClass,
        containerClassName
    } = useSidebar({
        paramKey,
        useMobileParams,
        closeOnPathnameChange,
        enableOutsideClick,
        position
    });

    // Toggle the sidebar when the prop is changed.
    useEffect(() => {
        if (isOpen) toggleSidebar();
        // this is on purpose
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Manage parent close state when the sidebar is closed.
    useEffect(() => {
        if (!isSidebarOpen && onClose) onClose();
    }, [isSidebarOpen, onClose]);

    const touchStart = useRef<{ x: number; y: number } | null>(null);

    const handleTouchStart = useCallback(
        (e: React.TouchEvent<HTMLDivElement>) => {
            const t = e.touches[0];
            touchStart.current = { x: t.clientX, y: t.clientY };
        },
        []
    );

    const handleTouchMove = useCallback(
        (e: React.TouchEvent<HTMLDivElement>) => {
            if (!touchStart.current) return;
            const t = e.touches[0];
            const dx = t.clientX - touchStart.current.x;
            const dy = t.clientY - touchStart.current.y;

            const THRESHOLD = 50;

            switch (position) {
                case 'bottom':
                    if (dy > THRESHOLD) {
                        touchStart.current = null;
                        toggleSidebar();
                    }
                    break;
                case 'top':
                    if (dy < -THRESHOLD) {
                        touchStart.current = null;
                        toggleSidebar();
                    }
                    break;
                case 'left':
                    if (dx < -THRESHOLD) {
                        touchStart.current = null;
                        toggleSidebar();
                    }
                    break;
                case 'right':
                    if (dx > THRESHOLD) {
                        touchStart.current = null;
                        toggleSidebar();
                    }
                    break;
            }
        },
        [toggleSidebar, position]
    );

    return hidden ? null : (
        <React.Fragment>
            {isSidebarOpen ? (
                <React.Fragment>
                    <div
                        className={classNames(
                            'fixed inset-0 z-20 w-screen bg-black bg-opacity-75 h-[100dvh]',
                            backdropClass
                        )}
                    />
                    <div
                        ref={contentRef}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        className={classNames(
                            'z-50 px-8 py-16 sheet shadow-[-4px_4px_15px_0_rgba(0,0,0,0.3)]',
                            'overflow-auto',
                            containerClassName,
                            className
                        )}
                    >
                        <IconButton
                            onClick={toggleSidebar}
                            icon="close"
                            className={classNames(
                                'absolute',
                                closeIconPositionClass[position]
                            )}
                        />
                        {children}
                    </div>
                </React.Fragment>
            ) : null}
        </React.Fragment>
    );
};
