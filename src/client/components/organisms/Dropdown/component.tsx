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
    label: React.ReactNode;
    onClick?: () => void;
    href?: string;
    disabled?: boolean;
    icon?: IconName;
    color?: 'primary' | 'danger';
}>;

export type DropdownProps = Readonly<{
    items: readonly DropdownItem[];
    children: React.ReactNode;
    className?: string;
    menuClassName?: string;
    position?: 'left' | 'center' | 'right';
}> &
    React.ComponentProps<'div'>;

export const Dropdown: React.FC<DropdownProps> = ({
    items,
    children,
    className,
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
            label,
            onClick,
            href,
            disabled,
            icon,
            color = 'primary'
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
                        href={href}
                        {...commonProps}
                        key={
                            typeof label === 'string'
                                ? label
                                : (href ?? Math.random())
                        }
                        role="menuitem"
                        tabIndex={-1}
                        prefetch={false}
                    >
                        {icon ? (
                            <Icon
                                key={`${icon}-${label}`}
                                size={20}
                                name={icon}
                                className={classConfig.colors[color]}
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
                    type="button"
                    {...commonProps}
                    key={
                        typeof label === 'string'
                            ? label
                            : (href ?? Math.random())
                    }
                    role="menuitem"
                    tabIndex={-1}
                >
                    {icon ? (
                        <Icon
                            key={`${icon}-${label}`}
                            size={20}
                            name={icon}
                            className={classConfig.colors[color]}
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
                        'absolute z-50 mt-2 min-w-24 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 focus:outline-none',
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
