'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { classNames } from '@/client/utils';
import { Icon, Typography } from '@/client/components';

export type AccordionItem = Readonly<{
    id?: string | number;
    title: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
}>;

export type AccordionProps = Readonly<{
    items: AccordionItem[];
    allowMultiple?: boolean;
    defaultOpen?: Array<number | string> | number | string;
    className?: string;
}> &
    React.PropsWithChildren;

export const Accordion: React.FC<AccordionProps> = ({
    allowMultiple = false,
    className,
    defaultOpen,
    items
}) => {
    const initialOpenSet = useMemo(() => {
        if (defaultOpen === undefined) return new Set<number | string>();
        if (Array.isArray(defaultOpen)) return new Set(defaultOpen);

        return new Set([defaultOpen]);
    }, [defaultOpen]);

    const [openItems, setOpenItems] =
        useState<Set<number | string>>(initialOpenSet);

    const toggleItem = useCallback(
        (key: number | string) =>
            (
                e:
                    | React.MouseEvent<HTMLButtonElement>
                    | React.KeyboardEvent<HTMLButtonElement>
            ) => {
                e.currentTarget.blur();

                setOpenItems((prev) => {
                    const newSet = new Set(prev);

                    if (newSet.has(key)) {
                        newSet.delete(key);
                    } else {
                        if (!allowMultiple) newSet.clear();
                        newSet.add(key);
                    }

                    return newSet;
                });
            },
        [allowMultiple]
    );

    return (
        <div className={classNames('flex flex-col w-full', className)}>
            {items.map(({ id, title, content, disabled }, index) => {
                const key = id ?? index;
                const isOpen = openItems.has(key);

                return (
                    <div
                        key={key}
                        className="border-b border-gray-300 dark:border-gray-700 last:border-none"
                    >
                        <button
                            type="button"
                            disabled={disabled}
                            aria-expanded={isOpen}
                            onClick={toggleItem(key)}
                            className={classNames(
                                'flex w-full items-center justify-between gap-2 py-3 px-2 md:px-4',
                                'transition-colors duration-150',
                                disabled
                                    ? 'cursor-not-allowed text-gray-400 dark:text-gray-500'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                                'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500'
                            )}
                        >
                            {typeof title === 'string' ? (
                                <Typography
                                    as="span"
                                    className="text-left font-medium"
                                >
                                    {title}
                                </Typography>
                            ) : (
                                title
                            )}

                            <Icon
                                name="chevronDoubleDown"
                                size={20}
                                className={classNames(
                                    'transform transition-transform duration-200 ease-in-out',
                                    isOpen ? 'rotate-90' : 'rotate-0'
                                )}
                            />
                        </button>

                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    key="content"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{
                                        duration: 0.1,
                                        ease: 'easeInOut'
                                    }}
                                    className="overflow-hidden px-2 pb-3 md:px-4"
                                >
                                    <div className="py-1">{content}</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
};
