'use client';

import React, { forwardRef } from 'react';
import { icons } from '@/client/components/atoms/Icons/names';
import type { IconName } from '@/client/types';
import classnames from 'classnames';
import { Typography } from '@/client/components';

export type IconProps = Readonly<{
    className?: string;
    disabled?: boolean;
    label?: string;
    name: IconName;
    size?: number;
}> &
    React.HTMLAttributes<HTMLDivElement> &
    React.RefAttributes<HTMLDivElement>;

export const Icon: React.FC<IconProps> = forwardRef<HTMLDivElement, IconProps>(
    ({ className, disabled, label, name, size = 24, ...props }, ref) => {
        const SvgComponent = icons[name];

        return (
            <div
                {...props}
                ref={ref}
                className={classnames(
                    'flex flex-col items-center gap-0.5',
                    disabled
                        ? 'text-gray-500 dark:text-gray-500'
                        : '!typography-base',
                    className
                )}
            >
                <SvgComponent
                    width={size}
                    height={size}
                    className={classnames(className)}
                />
                {label && (
                    <Typography className={`text-xs font-normal`}>
                        {label}
                    </Typography>
                )}
            </div>
        );
    }
);
