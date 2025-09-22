import React from 'react';
import { Icon, Loader } from '@/client/components';
import type { IconName } from '@/client/types';
import { classNames } from '@/client/utils';

export type IconButtonProps = Readonly<{
    className?: string;
    disabled?: boolean;
    icon: IconName;
    iconClassName?: string;
    loading?: boolean;
    onClick?: () => void;
    size?: number;
    tabIndex?: number;
    ariaLabel?: string;
}>;

export const IconButton: React.FC<IconButtonProps> = ({
    className,
    disabled,
    icon,
    iconClassName,
    loading,
    onClick = () => {},
    size,
    tabIndex,
    ariaLabel
}) => {
    return (
        <button
            className={classNames(
                'icon-button',
                disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                className
            )}
            tabIndex={tabIndex}
            type={'button'}
            onClick={onClick}
            disabled={disabled || loading}
            aria-label={ariaLabel}
        >
            {loading ? (
                <Loader size="sm" className={iconClassName} />
            ) : (
                <Icon name={icon} size={size} className={iconClassName} />
            )}
        </button>
    );
};
