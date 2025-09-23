import React from 'react';
import { classNames } from '@/client/utils';
import type { TypographyVariant } from '@/client/components';
import { Icon, Typography } from '@/client/components';
import type { IconName } from '@/client/types';

//~---------------------------------------------------------------------------------------------~//
//$                                           OPTIONS                                           $//
//~---------------------------------------------------------------------------------------------~//

const classConfig = {
    colors: {
        primary: {
            bgColor:
                'bg-primary-400 hover:bg-primary-500 dark:bg-primary-600 dark:hover:bg-primary-500 shadow-md',
            color: 'text-black dark:text-gray-200',
            outline: 'border border-primary-400'
        },
        secondary: {
            bgColor:
                'bg-secondary-400 hover:bg-secondary-500 dark:bg-secondary-800 dark:hover:bg-secondary-600 shadow-md',
            color: 'text-black dark:text-gray-200',
            outline: 'border border-secondary-400'
        },
        warning: {
            bgColor:
                'bg-warning-400 hover:bg-warning-500 dark:bg-warning-800 dark:hover:bg-warning-600 shadow-md',
            color: 'text-black dark:text-gray-200',
            outline: 'border border-warning-400'
        },
        danger: {
            bgColor:
                'bg-danger-400 hover:bg-danger-500 dark:bg-danger-800 dark:hover:bg-danger-600 shadow-md',
            color: 'text-black dark:text-gray-200',
            outline: 'border border-danger-400'
        },
        subtle: {
            bgColor:
                'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-transparent',
            color: 'text-black dark:text-gray-200',
            outline:
                'border border-gray-200 focus:outline-none dark:border-gray-700'
        }
    },
    sizes: {
        sm: {
            dimensions: 'py-1 px-2',
            text: 'text-sm',
            icon: 18,
            iconMargin: 'mr-1'
        },
        md: {
            dimensions: 'py-2 px-4',
            text: 'text-base',
            icon: 24,
            iconMargin: 'mr-2'
        },
        lg: {
            dimensions: 'py-3 px-6',
            text: 'text-base',
            icon: 28,
            iconMargin: 'mr-2'
        }
    }
};

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export type BaseButtonProps = Readonly<{
    color?: 'primary' | 'secondary' | 'danger' | 'subtle' | 'warning';
    icon?: IconName;
    outlined?: boolean;
    size?: 'sm' | 'md' | 'lg';
    textClassName?: string;
    textVariant?: TypographyVariant;
    uppercase?: boolean;
}> &
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> &
    React.PropsWithChildren<NonNullable<unknown>>;

export const ButtonBase: React.FC<BaseButtonProps> = ({
    children,
    className,
    color = 'primary',
    icon,
    onClick,
    outlined = false,
    size = 'md',
    textClassName,
    textVariant,
    type = 'button',
    uppercase,
    ...props
}) => {
    if (!Object.keys(classConfig.colors).includes(color)) {
        color = 'primary';
    }

    if (!Object.keys(classConfig.sizes).includes(size)) {
        size = 'md';
    }

    return (
        <button
            {...props}
            onClick={onClick}
            type={type}
            className={classNames(
                'base-button',
                classConfig.colors[color].bgColor,
                classConfig.colors[color].color,
                outlined && classConfig.colors[color].outline,
                classConfig.sizes[size].dimensions,
                'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none',
                uppercase && 'uppercase',
                className
            )}
        >
            {icon ? (
                <Icon
                    name={icon}
                    size={classConfig.sizes[size].icon}
                    className={classConfig.sizes[size].iconMargin}
                />
            ) : null}
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
        </button>
    );
};
