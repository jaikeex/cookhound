import React from 'react';
import { Icon } from '@/client/components';
import type { IconName } from '@/client/types';
import classnames from 'classnames';

export type IconButtonProps = Readonly<{
    className?: string;
    disabled?: boolean;
    icon: IconName;
    onClick: () => void;
    size?: number;
    tabIndex?: number;
}>;

export const IconButton: React.FC<IconButtonProps> = ({
    className,
    disabled,
    icon,
    onClick,
    size,
    tabIndex
}) => {
    return (
        <button
            className={classnames(
                'icon-button',
                disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                className
            )}
            tabIndex={tabIndex}
            type={'button'}
            onClick={onClick}
            disabled={disabled}
        >
            <Icon name={icon} size={size} />
        </button>
    );
};
