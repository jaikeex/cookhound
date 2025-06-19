'use client';

import React, { useCallback, useState } from 'react';
import classnames from 'classnames';
import { TabButton } from '@/client/components';
import classNames from 'classnames';

export type TabContent = {
    title: string;
    content: React.ReactNode;
};

export type TabsProps = Readonly<{
    activeTab?: number;
    onTabChange?: (tabIndex: number) => void;
    tabs: TabContent[];
    className?: string;
}> &
    React.PropsWithChildren;

export const Tabs: React.FC<TabsProps> = ({
    activeTab = 0,
    onTabChange,
    tabs,
    className
}) => {
    const [currentTab, setCurrentTab] = useState<number>(activeTab);

    const tabWidth = 100 / tabs.length;

    const handleTabChange = useCallback(
        (index: number) => () => {
            setCurrentTab(index);
            onTabChange && onTabChange(index);
        },
        [onTabChange]
    );

    return (
        <div className={className}>
            <div
                className={classNames(
                    'flex flex-row items-center rounded-md w-full relative',
                    'bg-gray-200 dark:bg-gray-800'
                )}
            >
                {tabs.map((tab, index) => (
                    <TabButton
                        onClick={handleTabChange(index)}
                        key={index}
                        active={currentTab === index}
                        tabWidth={tabWidth}
                    >
                        {tab.title}
                    </TabButton>
                ))}
                {/* highlighter which moves to the active tab position */}
                <div
                    className={classnames(
                        'h-full bg-blue-600 opacity-20 w-1/3 absolute rounded-md',
                        `transition-transform duration-200 ease-in-out`,
                        'top-0 pointer-events-none z-0'
                    )}
                    style={{
                        width: `${tabWidth}%`,
                        transform: `translateX(${currentTab * 100}%)`
                    }}
                />
            </div>
            <div className={'mt-3 px-2'}>{tabs[currentTab].content}</div>
        </div>
    );
};
