import React from 'react';
import { Icon } from '@/client/components';
import type { IconName } from '@/client/types';
import classnames from 'classnames';

export type IconButtonProps = Readonly<{
    className?: string;
    icon: IconName;
    onClick: () => void;
    size?: number;
    tabIndex?: number;
}>;

export const IconButton: React.FC<IconButtonProps> = ({
    className,
    icon,
    onClick,
    size,
    tabIndex
}) => {
    return (
        <button
            className={classnames(
                'min-h-7 min-w-7 flex items-center justify-center rounded hover:bg-gray-200',
                'dark:hover:bg-gray-800 transition-colors',

                className
            )}
            tabIndex={tabIndex}
            type={'button'}
            onClick={onClick}
        >
            <Icon name={icon} size={size} />
        </button>
    );
};
