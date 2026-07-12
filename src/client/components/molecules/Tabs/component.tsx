'use client';

import React, { Suspense, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
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

/**
 * Resolves a tab index from a raw url param value.
 *
 * @param urlParam - The raw value of the tab url param (or null when absent)
 * @param tabs - The tab definitions to match the param against
 * @param fallbackTab - The index to fall back to when the param cannot be resolved
 */
const resolveTabFromParam = (
    urlParam: string | null,
    tabs: TabContent[],
    fallbackTab: number
): number => {
    if (!urlParam) {
        return fallbackTab;
    }

    const tabIndex = tabs.findIndex((tab) => tab.param === urlParam);

    if (tabIndex !== -1) {
        return tabIndex;
    }

    /**
     * This should never be invoked, but seemed correct to try and handle and should also somewhat guard against
     * potential misuse later.
     */
    const parsedIndex = parseInt(urlParam, 10);

    if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < tabs.length) {
        return parsedIndex;
    }

    return fallbackTab;
};

type TabsParamSyncProps = Readonly<{
    paramKey: string;
    onParamChange: () => void;
}>;

/**
 * Renders nothing - exists only to subscribe to url param changes.
 *
 * useSearchParams() (called inside useParamsChangeListener) forces statically
 * rendered pages to bail out to client-side rendering up to the nearest
 * Suspense boundary. When Tabs itself subscribed, that bailout climbed to the
 * route-level boundary and wiped the entire recipe page body from the
 * prerendered HTML. Confining the subscription to this null-rendering child -
 * mounted only when enableNavigation is set and wrapped in its own Suspense -
 * keeps the tab content in the server-rendered document.
 *
 * The listener also fires once on mount, which is what corrects the initially
 * server-rendered default tab to the one from the url param.
 */
const TabsParamSync: React.FC<TabsParamSyncProps> = ({
    paramKey,
    onParamChange
}) => {
    useParamsChangeListener({ key: paramKey, onChange: onParamChange });
    return null;
};

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

    const tabWidth = 100 / tabs.length;

    const [currentTab, setCurrentTab] = useState<number>(activeTab);

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
            onTabChange?.(index);
        },
        [onTabChange, updateUrlParam]
    );

    const handleParamChange = useCallback(() => {
        // Read the param imperatively, subscribing through useSearchParams()
        // in this component would opt every statically rendered page that
        // uses Tabs out of prerendering.
        const urlParam = new URLSearchParams(window.location.search).get(
            paramKey
        );

        setCurrentTab(resolveTabFromParam(urlParam, tabs, activeTab));
    }, [paramKey, tabs, activeTab]);

    return (
        <div className={classNames(className)}>
            {enableNavigation && (
                <Suspense fallback={null}>
                    <TabsParamSync
                        paramKey={paramKey}
                        onParamChange={handleParamChange}
                    />
                </Suspense>
            )}

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
