'use client';

import React, { useCallback, useRef } from 'react';
import { Icon } from '@/client/components';
import { classNames } from '@/client/utils';

export type StarProps = Readonly<{
    className?: string;
    disabled?: boolean;
    fill?: 'gold' | 'silver' | 'bronze';
    highlight?: boolean;
    iconSize?: number;
    onMouseMove?: (isInLeftHalf: boolean) => void;
    pulse?: boolean;
    state: 'full' | 'half' | 'empty';
}>;

export enum StarState {
    FULL = 'full',
    HALF = 'half',
    EMPTY = 'empty'
}

const config = {
    fill: {
        gold: 'fill-yellow-500 dark:fill-yellow-400',
        silver: 'fill-gray-600 dark:fill-gray-400',
        bronze: 'fill-red-500 dark:fill-red-400'
    },
    icon: {
        full: 'starFull' as const,
        half: 'starHalf' as const,
        empty: 'star' as const
    }
};

export const Star: React.FC<StarProps> = ({
    className,
    disabled = false,
    fill = 'gold',
    highlight = false,
    iconSize = 32,
    onMouseMove,
    pulse,
    state
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const rect = ref.current?.getBoundingClientRect();

            if (!rect) return;

            const x = e.clientX - rect.left; // x position within the element
            const halfWidth = rect.width / 2;

            if (x < halfWidth) {
                onMouseMove?.(true);
            } else {
                onMouseMove?.(false);
            }
        },
        [ref, onMouseMove]
    );

    return (
        <Icon
            ref={ref}
            onMouseMove={handleMouseMove}
            name={config.icon[state]}
            size={iconSize}
            className={classNames(
                config.fill[fill],
                highlight && 'scale-105',
                pulse && 'animate-rating-pulse',
                'transition-all duration-200',
                disabled ? 'cursor-default' : 'cursor-pointer',
                className
            )}
        />
    );
};
