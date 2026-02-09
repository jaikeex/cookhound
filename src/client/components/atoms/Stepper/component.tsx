import React from 'react';
import { Icon } from '@/client/components';
import { classNames } from '@/client/utils';

//~---------------------------------------------------------------------------------------------~//
//$                                           OPTIONS                                           $//
//~---------------------------------------------------------------------------------------------~//

const classConfig = {
    size: {
        sm: {
            button: 'h-6 w-6',
            icon: 16
        },
        md: {
            button: 'h-7 w-7',
            icon: 18
        },
        lg: {
            button: 'h-8 w-8',
            icon: 20
        }
    }
};

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export type StepperProps = Readonly<{
    className?: string;
    disabled?: boolean;
    downAriaLabel?: string;
    downDisabled?: boolean;
    iconClassName?: string;
    onDown?: () => void;
    onUp?: () => void;
    size?: 'sm' | 'md' | 'lg';
    upAriaLabel?: string;
    upDisabled?: boolean;
    buttonClassName?: string;
}> &
    React.HTMLAttributes<HTMLDivElement>;

export const Stepper: React.FC<StepperProps> = ({
    className,
    disabled,
    downAriaLabel = 'Decrease',
    downDisabled,
    iconClassName,
    onDown = () => {},
    onUp = () => {},
    size = 'sm',
    upAriaLabel = 'Increase',
    upDisabled,
    buttonClassName,
    children,
    ...props
}) => {
    const isUpDisabled = disabled || upDisabled;
    const isDownDisabled = disabled || downDisabled;
    const sizeConfig = classConfig.size[size];

    return (
        <div
            {...props}
            className={classNames(
                'inline-flex overflow-hidden rounded-md',
                'border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
                className
            )}
        >
            <button
                type="button"
                aria-label={downAriaLabel}
                disabled={isDownDisabled}
                onClick={onDown}
                className={classNames(
                    'flex items-center justify-center',
                    'transition-colors duration-150',
                    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    isDownDisabled &&
                        'cursor-not-allowed opacity-50 pointer-events-none',
                    sizeConfig.button,
                    buttonClassName
                )}
            >
                <Icon
                    name="minus"
                    size={sizeConfig.icon}
                    className={iconClassName}
                />
            </button>

            {children}
            <button
                type="button"
                aria-label={upAriaLabel}
                disabled={isUpDisabled}
                onClick={onUp}
                className={classNames(
                    'flex items-center justify-center border-l border-gray-200 dark:border-gray-700',
                    'transition-colors duration-150',
                    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    isUpDisabled &&
                        'cursor-not-allowed opacity-50 pointer-events-none',
                    sizeConfig.button,
                    buttonClassName
                )}
            >
                <Icon
                    name="plus"
                    size={sizeConfig.icon}
                    className={iconClassName}
                />
            </button>
        </div>
    );
};
