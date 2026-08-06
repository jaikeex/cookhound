'use client';

import React, { useCallback } from 'react';
import { classNames } from '@/client/utils';
import { TabButton } from '@/client/components/atoms/Button/Tab';

export type TabBarProps = Readonly<{
    activeIndex: number;
    className?: string;
    onTabSelect: (index: number) => void;
    titles: readonly string[];
}>;

export const TabBar: React.FC<TabBarProps> = ({
    activeIndex,
    className,
    onTabSelect,
    titles
}) => {
    const tabWidth = 100 / titles.length;

    const handleTabClick = useCallback(
        (index: number) => () => {
            onTabSelect(index);
        },
        [onTabSelect]
    );

    return (
        <div
            className={classNames(
                'relative flex flex-row items-center w-full rounded-md',
                'bg-gray-200 dark:bg-gray-800',
                className
            )}
        >
            {titles.map((title, index) => (
                <TabButton
                    onClick={handleTabClick(index)}
                    key={index}
                    active={activeIndex === index}
                    tabWidth={tabWidth}
                    ariaLabel={title}
                >
                    {title}
                </TabButton>
            ))}

            <div
                className={classNames(
                    'absolute w-1/3 h-full bg-blue-600 rounded-md opacity-20',
                    `transition-transform duration-200 ease-in-out`,
                    'top-0 z-0 pointer-events-none'
                )}
                style={{
                    width: `${tabWidth}%`,
                    transform: `translateX(${activeIndex * 100}%)`
                }}
            />
        </div>
    );
};
