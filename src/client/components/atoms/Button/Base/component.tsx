import React from 'react';
import classNames from 'classnames';
import type { TypographyVariant } from '@/client/components';
import { Icon, Typography } from '@/client/components';
import type { IconName } from '@/client/types';

// ------------------------------- class config -------------------------------
//                                    region

const classConfig = {
    colors: {
        primary: {
            bgColor:
                'bg-primary-400 hover:bg-primary-500 dark:bg-primary-600 dark:hover:bg-primary-500 shadow-md',
            color: 'text-black dark:text-gray-200',
            outline: 'focus:ring-2 focus:ring-primary-400 md:focus:ring-0'
        },
        secondary: {
            bgColor:
                'bg-secondary-400 hover:bg-secondary-500 dark:bg-secondary-800 dark:hover:bg-secondary-600 shadow-md',
            color: 'text-black dark:text-gray-200',
            outline: 'focus:ring-2 focus:ring-primary-400 md:focus:ring-0'
        },
        subtle: {
            bgColor:
                'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-transparent',
            color: 'text-black dark:text-gray-200',
            outline: 'focus:ring-2 focus:ring-primary-400 md:focus:ring-0'
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

//                                  endregion
// ----------------------------------------------------------------------------

export type BaseButtonProps = Readonly<{
    color?: 'primary' | 'secondary' | 'subtle';
    icon?: IconName;
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
    size = 'md',
    textClassName,
    textVariant,
    type = 'button',
    uppercase,
    ...props
}) => {
    return (
        <button
            {...props}
            onClick={onClick}
            type={type}
            className={classNames(
                'base-button',
                classConfig.colors[color].bgColor,
                classConfig.colors[color].color,
                classConfig.colors[color].outline,
                classConfig.sizes[size].dimensions,
                uppercase ? 'uppercase' : '',
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
