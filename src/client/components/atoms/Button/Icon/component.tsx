import React from 'react';
import { Icon } from '@/client/components/atoms/Icons';
import { Loader } from '@/client/components/atoms/Loader';
import type { IconName } from '@/client/types';
import { classNames } from '@/client/utils';

export type IconButtonProps = Readonly<{
    className?: string;
    disabled?: boolean;
    icon: IconName;
    iconClassName?: string;
    inheritIconColor?: boolean;
    loading?: boolean;
    onClick?: () => void;
    onPointerDown?: (event: React.PointerEvent) => void;
    size?: number;
    tabIndex?: number;
}> &
    Pick<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        'aria-label' | 'aria-pressed'
    >;

export const IconButton: React.FC<IconButtonProps> = React.forwardRef<
    HTMLButtonElement,
    IconButtonProps
>(
    (
        {
            className,
            disabled,
            icon,
            iconClassName,
            inheritIconColor,
            loading,
            onClick = () => {},
            onPointerDown,
            size,
            tabIndex,
            ...props
        },
        ref
    ) => {
        return (
            <button
                {...props}
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
                ref={ref}
            >
                {loading ? (
                    <Loader size="sm" className={iconClassName} />
                ) : (
                    <Icon
                        name={icon}
                        size={size}
                        className={iconClassName}
                        inheritColor={inheritIconColor}
                    />
                )}
            </button>
        );
    }
);
