'use client';

import classNames from 'classnames';
import React, { useEffect } from 'react';
import { useSidebar } from './useSidebar';
import { IconButton } from '@/client/components/atoms';
import { SidebarHandle } from './Handle';

type SidebarProps = Readonly<{
    className?: string;
    closeOnPathnameChange?: boolean;
    enableOutsideClick?: boolean;
    hidden?: boolean;
    isOpen?: boolean;
    label?: string;
    onClose?: () => void;
    paramKey?: string;
    position?: 'left' | 'right' | 'top' | 'bottom';
    useMobileParams?: boolean;
    withHandle?: boolean;
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
    label,
    onClose,
    paramKey,
    position = 'right',
    useMobileParams = true,
    withHandle = false
}) => {
    const {
        contentRef,
        toggleSidebar,
        isSidebarOpen,
        isAnimatingOpen,
        backdropClass,
        containerClassName,
        sidebarDimensions
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

    return hidden ? null : (
        <React.Fragment>
            {withHandle ? (
                <SidebarHandle
                    onClick={toggleSidebar}
                    isOpen={isAnimatingOpen}
                    position={position}
                    sidebarDimensions={sidebarDimensions}
                    label={label}
                    className={hidden ? 'hidden' : ''}
                />
            ) : null}
            {isSidebarOpen ? (
                <React.Fragment>
                    <div
                        className={classNames(
                            'fixed inset-0 z-20 w-screen h-screen bg-black bg-opacity-75',
                            backdropClass
                        )}
                    />
                    <div
                        ref={contentRef}
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
