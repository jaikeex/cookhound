'use client';

import React, { useMemo, useRef, useCallback } from 'react';
import { classNames } from '@/client/utils';
import { Typography } from '@/client/components';

export type SidebarHandleProps = Readonly<{
    onOpen: () => void;
    position?: 'left' | 'right' | 'top' | 'bottom';
    label?: string;
    className?: string;
}>;

const classConfig = {
    top: {
        container:
            'fixed left-1/2 -translate-x-1/2 top-0 w-32 h-9 rounded-b-2xl',
        bar: 'w-10 h-1.5'
    },
    left: {
        container:
            'fixed top-1/2 -translate-y-1/2 left-0 h-32 w-9 rounded-r-2xl',
        bar: 'h-10 w-1.5'
    },
    right: {
        container:
            'fixed top-1/2 -translate-y-1/2 right-0 h-32 w-9 rounded-l-2xl',
        bar: 'h-10 w-1.5'
    },
    bottom: {
        container:
            'fixed left-1/2 -translate-x-1/2 bottom-0 w-32 h-9 rounded-t-2xl',
        bar: 'w-10 h-1.5'
    }
};

/**
 * The component is meant to be used anywhere a sidebar needs to be pulled into view.
 */
export const SidebarHandle: React.FC<SidebarHandleProps> = ({
    onOpen,
    position = 'bottom',
    label,
    className
}) => {
    const touchStartY = useRef<number | null>(null);
    const touchStartX = useRef<number | null>(null);

    const handleTouchStart = useCallback(
        (e: React.TouchEvent<HTMLButtonElement>) => {
            const touch = e.touches[0];
            touchStartY.current = touch.clientY;
            touchStartX.current = touch.clientX;
        },
        []
    );

    const handleTouchMove = useCallback(
        (e: React.TouchEvent<HTMLButtonElement>) => {
            const touch = e.touches[0];

            switch (position) {
                case 'bottom': {
                    if (touchStartY.current === null) return;
                    const deltaY = touchStartY.current - touch.clientY;
                    if (deltaY > 50) {
                        touchStartY.current = null;
                        onOpen();
                    }
                    break;
                }
                case 'top': {
                    if (touchStartY.current === null) return;
                    const deltaY = touch.clientY - touchStartY.current;
                    if (deltaY > 50) {
                        touchStartY.current = null;
                        onOpen();
                    }
                    break;
                }
                case 'left': {
                    if (touchStartX.current === null) return;
                    const deltaX = touch.clientX - touchStartX.current;
                    if (deltaX > 50) {
                        touchStartX.current = null;
                        onOpen();
                    }
                    break;
                }
                case 'right': {
                    if (touchStartX.current === null) return;
                    const deltaX = touchStartX.current - touch.clientX;
                    if (deltaX > 50) {
                        touchStartX.current = null;
                        onOpen();
                    }
                    break;
                }
            }
        },
        [position, onOpen]
    );

    const handleClick = useCallback(() => {
        onOpen();
    }, [onOpen]);

    const buttonClassName = useMemo(
        () =>
            classNames(
                classConfig[position].container,
                'z-40',
                'bg-[#d1fae5] dark:bg-[#021812]',
                'shadow-md shadow-black/10 dark:shadow-black/40',
                'flex items-center justify-center',
                '[&_*]:select-none touch-none',
                className
            ),
        [position, className]
    );

    const content = useMemo(() => {
        if (label) {
            return (
                <Typography
                    as="span"
                    variant="label"
                    className={classNames(
                        'whitespace-nowrap',
                        position === 'left' && 'rotate-90',
                        position === 'right' && '-rotate-90'
                    )}
                >
                    {label.toUpperCase()}
                </Typography>
            );
        }

        return (
            <Typography
                as="span"
                className={classNames(
                    'block rounded-full bg-gray-400 dark:bg-gray-500',
                    classConfig[position].bar
                )}
            />
        );
    }, [label, position]);

    return (
        <button
            type="button"
            aria-label={label ?? 'Open preview'}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className={buttonClassName}
        >
            {content}
        </button>
    );
};
