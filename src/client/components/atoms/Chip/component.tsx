import { classNames } from '@/client/utils';
import * as React from 'react';
import { Icon, Typography } from '@/client/components';
import type { TypographyVariant } from '@/client/components';
import type { IconName } from '@/client/types';

//~---------------------------------------------------------------------------------------------~//
//$                                           OPTIONS                                           $//
//~---------------------------------------------------------------------------------------------~//

const classConfig = {
    colors: {
        primary: {
            bgColor: 'bg-primary-400 dark:bg-primary-600 shadow-md',
            color: 'text-black dark:text-gray-200',
            outline: 'border border-primary-400'
        },
        secondary: {
            bgColor: 'bg-secondary-400 dark:bg-secondary-800 shadow-md',
            color: 'text-black dark:text-gray-200',
            outline: 'border border-secondary-400'
        },
        warning: {
            bgColor: 'bg-warning-400 dark:bg-warning-800 shadow-md',
            color: 'text-black dark:text-gray-200',
            outline: 'border border-warning-400'
        },
        danger: {
            bgColor: 'bg-danger-400 dark:bg-danger-800 shadow-md',
            color: 'text-black dark:text-gray-200',
            outline: 'border border-danger-400'
        },
        subtle: {
            bgColor: 'bg-transparent disabled:bg-transparent',
            color: 'text-black dark:text-gray-200',
            outline: 'border border-gray-200 dark:border-gray-700'
        }
    },
    sizes: {
        xs: {
            dimensions: 'py-0.5 px-2',
            text: 'text-xs',
            icon: 12,
            iconMargin: 'ml-1'
        },
        sm: {
            dimensions: 'py-1 px-3',
            text: 'text-sm',
            icon: 14,
            iconMargin: 'ml-1'
        },
        md: {
            dimensions: 'py-1.5 px-3',
            text: 'text-sm',
            icon: 16,
            iconMargin: 'ml-1'
        },
        lg: {
            dimensions: 'py-2 px-4',
            text: 'text-sm',
            icon: 20,
            iconMargin: 'ml-1'
        }
    }
};

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export type ChipProps = Readonly<{
    color?: 'primary' | 'secondary' | 'danger' | 'subtle' | 'warning';
    icon?: IconName;
    outlined?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    textClassName?: string;
    textVariant?: TypographyVariant;
}> &
    React.HTMLAttributes<HTMLDivElement> &
    React.PropsWithChildren<NonNullable<unknown>>;

export const Chip: React.FC<ChipProps> = ({
    children,
    className,
    icon,
    color = 'primary',
    outlined = false,
    size = 'md',
    textClassName,
    textVariant
}) => {
    if (!Object.keys(classConfig.colors).includes(color)) {
        color = 'primary';
    }

    if (!Object.keys(classConfig.sizes).includes(size)) {
        size = 'md';
    }

    return (
        <div
            className={classNames(
                'inline-flex items-center justify-center rounded-full',
                classConfig.colors[color].bgColor,
                classConfig.colors[color].color,
                outlined && classConfig.colors[color].outline,
                classConfig.sizes[size].dimensions,
                className
            )}
        >
            <Typography
                as="span"
                variant={textVariant}
                className={classNames(
                    classConfig.sizes[size].text,
                    textClassName
                )}
            >
                {children}
            </Typography>
            {icon ? (
                <Icon
                    name={icon}
                    size={classConfig.sizes[size].icon}
                    className={classConfig.sizes[size].iconMargin}
                />
            ) : null}
        </div>
    );
};
