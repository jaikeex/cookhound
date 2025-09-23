import React from 'react';
import { classNames } from '@/client/utils';
import type { ChipProps } from '@/client/components';
import { Chip } from '@/client/components';

//~---------------------------------------------------------------------------------------------~//
//$                                           OPTIONS                                           $//
//~---------------------------------------------------------------------------------------------~//

const classConfig = {
    colors: {
        primary: {
            bgColor: 'hover:bg-primary-500 dark:hover:bg-primary-500'
        },
        secondary: {
            bgColor: 'hover:bg-secondary-500 dark:hover:bg-secondary-600'
        },
        warning: {
            bgColor: 'hover:bg-warning-500 dark:hover:bg-warning-600'
        },
        danger: {
            bgColor: 'hover:bg-danger-500 dark:hover:bg-danger-600'
        },
        subtle: {
            bgColor:
                'hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-transparent'
        }
    }
};

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

type ChipButtonProps = Readonly<{
    onClick: () => void;
}> &
    ChipProps &
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>;

export const ChipButton: React.FC<ChipButtonProps> = ({
    children,
    className,
    color = 'primary',
    id,
    onClick,
    outlined = false,
    size = 'md',
    ...props
}) => {
    return (
        <button onClick={onClick} id={id}>
            <Chip
                {...props}
                color={color}
                outlined={outlined}
                size={size}
                className={classNames(
                    'transition duration-150 flex items-center justify-center',
                    classConfig.colors[color].bgColor,
                    className
                )}
            >
                {children}
            </Chip>
        </button>
    );
};
