'use client';

import React, { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { classNames } from '@/client/utils';
import { TabButton } from '@/client/components';
import { useParamsChangeListener } from '@/client/hooks/routingListeners';

export type TabContent = {
    title: string;
    content: React.ReactNode;
    param?: string;
};

export type TabsProps = Readonly<{
    activeTab?: number;
    buttonRowClassName?: string;
    className?: string;
    enableNavigation?: boolean;
    onTabChange?: (tabIndex: number) => void;
    paramKey?: string;
    tabs: TabContent[];
}> &
    React.PropsWithChildren;

export const Tabs: React.FC<TabsProps> = ({
    activeTab = 0,
    buttonRowClassName,
    className,
    enableNavigation = false,
    onTabChange,
    paramKey = 'tab',
    tabs
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const tabWidth = 100 / tabs.length;

    const resolveTabFromParam = useCallback(
        (urlParam: string | null): number => {
            if (!urlParam || !enableNavigation) return activeTab;

            const tabIndex = tabs.findIndex((tab) => tab.param === urlParam);
            if (!isNaN(tabIndex) && tabIndex !== -1) return tabIndex;

            /**
             * This should never be invoked, but seemed correct to try and handle and should also somewhat guard against
             * potential misuse later.
             */
            const parsedIndex = parseInt(urlParam, 10);
            if (
                !isNaN(parsedIndex) &&
                parsedIndex >= 0 &&
                parsedIndex < tabs.length
            ) {
                return parsedIndex;
            }

            return activeTab;
        },
        [tabs, activeTab, enableNavigation]
    );

    const getInitialTab = useCallback(() => {
        if (!enableNavigation) return activeTab;
        return resolveTabFromParam(searchParams.get(paramKey));
    }, [
        enableNavigation,
        activeTab,
        resolveTabFromParam,
        searchParams,
        paramKey
    ]);

    const [currentTab, setCurrentTab] = useState<number>(getInitialTab);

    const updateUrlParam = useCallback(
        (index: number) => {
            if (!enableNavigation) {
                return;
            }

            if (!tabs[index]) {
                return;
            }

            const currentUrl = new URL(window.location.href);
            const tab = tabs[index];
            const paramValue = tab.param || index.toString();

            currentUrl.searchParams.set(paramKey, paramValue);
            router.replace(currentUrl.pathname + currentUrl.search, {
                scroll: false
            });
        },
        [enableNavigation, router, paramKey, tabs]
    );

    const handleTabChange = useCallback(
        (index: number) => () => {
            setCurrentTab(index);
            updateUrlParam(index);
            onTabChange && onTabChange(index);
        },
        [onTabChange, updateUrlParam]
    );

    const handleParamChange = useCallback(() => {
        if (!enableNavigation) return;

        const urlParam = searchParams.get(paramKey);
        const newTabIndex = resolveTabFromParam(urlParam);

        if (newTabIndex !== currentTab) {
            setCurrentTab(newTabIndex);
        }
    }, [
        enableNavigation,
        searchParams,
        paramKey,
        resolveTabFromParam,
        currentTab
    ]);

    useParamsChangeListener({
        key: paramKey,
        onChange: enableNavigation ? handleParamChange : undefined
    });

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
                        ariaLabel={tab.title}
                    >
                        {tab.title}
                    </TabButton>
                ))}
                {/* highlighter which moves to the active tab position */}
                <div
                    className={classNames(
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
            <div className={'mt-3 min-h-16'}>{tabs[currentTab]?.content}</div>
        </div>
    );
};
