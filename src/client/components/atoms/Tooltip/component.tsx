'use client';

import React, { useCallback, useState } from 'react';
import classnames from 'classnames';
import { Typography } from '@/client/components';

type TooltipProps = Readonly<{
    className?: string;
    disabled?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    text: string;
}> &
    React.PropsWithChildren<NonNullable<unknown>>;

const classConfig = {
    position: {
        top: 'left-1/2 transform -translate-x-1/2 bottom-full mb-2',
        bottom: 'left-1/2 transform -translate-x-1/2 top-full mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    }
};

export const Tooltip: React.FC<TooltipProps> = ({
    children,
    disabled,
    className,
    position,
    text
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const handleMouseEnter = useCallback(() => setIsVisible(true), []);

    const handleMouseLeave = useCallback(() => setIsVisible(false), []);

    return (
        <div
            className={`${className} relative group`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            <div
                className={classnames(
                    'absolute hidden bg-gray-300 dark:bg-gray-800 text-xs rounded py-2 px-2 z-10',
                    'transition-all duration-200 ease-in-out w-max max-w-64',
                    isVisible ? 'opacity-100' : 'opacity-0',
                    classConfig.position[position ?? 'bottom'],
                    disabled ? '' : 'group-hover:block'
                )}
            >
                <Typography align={'center'} variant={'body-sm'}>
                    {text}
                </Typography>
            </div>
        </div>
    );
};
