import React from 'react';
import { Icon, Loader } from '@/client/components';
import type { IconName } from '@/client/types';
import { classNames } from '@/client/utils';

export type IconButtonProps = Readonly<{
    ariaLabel?: string;
    className?: string;
    disabled?: boolean;
    icon: IconName;
    iconClassName?: string;
    loading?: boolean;
    onClick?: () => void;
    onPointerDown?: (event: React.PointerEvent) => void;
    size?: number;
    tabIndex?: number;
}>;

export const IconButton: React.FC<IconButtonProps> = React.forwardRef<
    HTMLButtonElement,
    IconButtonProps
>(
    (
        {
            ariaLabel,
            className,
            disabled,
            icon,
            iconClassName,
            loading,
            onClick = () => {},
            onPointerDown,
            size,
            tabIndex
        },
        ref
    ) => {
        return (
            <button
                className={classNames(
                    'icon-button',
                    disabled &&
                        'opacity-50 cursor-not-allowed pointer-events-none',
                    className
                )}
                tabIndex={tabIndex}
                type={'button'}
                onClick={onClick}
                onPointerDown={onPointerDown}
                disabled={disabled || loading}
                aria-label={ariaLabel}
                ref={ref}
            >
                {loading ? (
                    <Loader size="sm" className={iconClassName} />
                ) : (
                    <Icon name={icon} size={size} className={iconClassName} />
                )}
            </button>
        );
    }
);
