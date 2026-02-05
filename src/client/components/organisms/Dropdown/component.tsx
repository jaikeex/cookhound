'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';

import { classNames } from '@/client/utils';
import { useOutsideClick } from '@/client/hooks';
import type { IconName } from '@/client/types';
import { Icon } from '@/client/components';

const classConfig = {
    colors: {
        primary: 'hover:bg-gray-200 dark:hover:bg-gray-600',
        danger: 'text-danger-600 dark:text-danger-400 '
    }
};

export type DropdownItem = Readonly<{
    color?: 'primary' | 'danger';
    disabled?: boolean;
    href?: string;
    icon?: IconName;
    label: React.ReactNode;
    onClick?: () => void;
}>;

export type DropdownProps = Readonly<{
    children: React.ReactNode;
    className?: string;
    items: readonly DropdownItem[];
    menuClassName?: string;
    position?: 'left' | 'center' | 'right';
}> &
    React.ComponentProps<'div'>;

export const Dropdown: React.FC<DropdownProps> = ({
    children,
    className,
    items,
    menuClassName,
    position = 'right',
    ...rest
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const containerRef = useOutsideClick<HTMLDivElement>(() =>
        setIsOpen(false)
    );

    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    const close = useCallback(() => setIsOpen(false), []);

    const placementClass = React.useMemo(() => {
        switch (position) {
            case 'left':
                return 'right-0 origin-top-left';
            case 'center':
                return 'left-1/2 -translate-x-1/2 origin-top';
            default:
                return 'left-0 origin-top-right';
        }
    }, [position]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Escape') close();
        },
        [close]
    );

    const renderedItems = items.map((item) => {
        const {
            color = 'primary',
            disabled,
            href,
            icon,
            label,
            onClick
        } = item;

        const commonProps = {
            className: classNames(
                'block w-full text-left py-2 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
                disabled && 'pointer-events-none opacity-60',
                'cursor-pointer transition-colors flex items-center gap-3',
                icon ? 'px-2' : 'px-4',
                classConfig.colors[color]
            ),
            onClick: (e: React.MouseEvent) => {
                if (disabled) return;

                onClick?.();
                close();

                if (!href) {
                    e.preventDefault();
                }
            }
        } as const;

        if (href) {
            return (
                <li role="none" key={href}>
                    <Link
                        {...commonProps}
                        aria-label={label?.toString()}
                        href={href}
                        key={
                            typeof label === 'string'
                                ? label
                                : (href ?? Math.random())
                        }
                        prefetch={false}
                        role="menuitem"
                    >
                        {icon ? (
                            <Icon
                                className={classConfig.colors[color]}
                                key={`${icon}-${label}`}
                                name={icon}
                                size={20}
                            />
                        ) : null}
                        {label}
                    </Link>
                </li>
            );
        }

        return (
            <li
                role="none"
                key={
                    typeof label === 'string' ? label : (href ?? Math.random())
                }
            >
                <button
                    {...commonProps}
                    key={
                        typeof label === 'string'
                            ? label
                            : (href ?? Math.random())
                    }
                    role="menuitem"
                    tabIndex={-1}
                    type="button"
                >
                    {icon ? (
                        <Icon
                            className={classConfig.colors[color]}
                            key={`${icon}-${label}`}
                            name={icon}
                            size={20}
                        />
                    ) : null}
                    {label}
                </button>
            </li>
        );
    });

    return (
        <div
            ref={containerRef}
            className={classNames('relative inline-block text-left', className)}
            onKeyDown={handleKeyDown}
            {...rest}
        >
            <div onClick={toggle} className="cursor-pointer select-none">
                {children}
            </div>

            {isOpen ? (
                <ul
                    role="menu"
                    className={classNames(
                        'absolute z-50 mt-2 min-w-24 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 focus:outline-hidden',
                        'animate-fade-in',
                        placementClass,
                        menuClassName
                    )}
                >
                    {renderedItems}
                </ul>
            ) : null}
        </div>
    );
};

export default Dropdown;
