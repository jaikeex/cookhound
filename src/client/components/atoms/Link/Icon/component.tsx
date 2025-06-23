import * as React from 'react';
import { Icon } from '@/client/components';
import type { IconName } from '@/client/types';
import classNames from 'classnames';
import Link from 'next/link';

type IconLinkProps = Readonly<{
    className?: string;
    disabled?: boolean;
    icon: IconName;
    href: string;
}>;

export const IconLink: React.FC<IconLinkProps> = ({
    className,
    disabled,
    icon,
    href
}) => {
    return (
        <Link
            href={href}
            className={classNames(
                'icon-button',
                disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                className
            )}
        >
            <Icon name={icon} />
        </Link>
    );
};
