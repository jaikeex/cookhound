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
    buttonRowClassName?: string;
    className?: string;
    onTabChange?: (tabIndex: number) => void;
    tabs: TabContent[];
}> &
    React.PropsWithChildren;

export const Tabs: React.FC<TabsProps> = ({
    activeTab = 0,
    onTabChange,
    tabs,
    buttonRowClassName,
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
        <div className={classNames(className)}>
            <div
                className={classNames(
                    'relative flex flex-row items-center w-full rounded-md',
                    'bg-gray-200 dark:bg-gray-800',
                    buttonRowClassName
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
                        'absolute w-1/3 h-full bg-blue-600 rounded-md opacity-20',
                        `transition-transform duration-200 ease-in-out`,
                        'top-0 z-0 pointer-events-none'
                    )}
                    style={{
                        width: `${tabWidth}%`,
                        transform: `translateX(${currentTab * 100}%)`
                    }}
                />
            </div>
            <div className={'px-2 mt-3'}>{tabs[currentTab].content}</div>
        </div>
    );
};
