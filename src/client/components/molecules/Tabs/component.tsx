'use client';

import React, { Suspense, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { classNames } from '@/client/utils';
import { TabBar } from '@/client/components/molecules/Tabs/Bar';
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

/**
 * Stable identity of a tab, used to track the selection instead of a bare index.
 *
 * A caller may change the tab set while this is mounted - the profile grows a
 * dashboard tab once auth resolves, which pushes every other tab one place
 * along - and an index would then silently point at whichever tab shifted into
 * it. Tabs without a param fall back to their index, which is the old behavior.
 *
 * @param tab - The tab to identify, or undefined for an out-of-range index
 * @param index - Position of the tab in the current set
 */
const tabIdentity = (tab: TabContent | undefined, index: number): string =>
    tab?.param ?? String(index);

/**
 * Resolves an identity back to its position in the current tab set.
 *
 * @param identity - The identity to look up
 * @param tabs - The tab definitions to search
 * @param fallbackTab - The index to fall back to when the identity is gone
 */
const resolveIndexFromIdentity = (
    identity: string,
    tabs: TabContent[],
    fallbackTab: number
): number => {
    const tabIndex = tabs.findIndex(
        (tab, index) => tabIdentity(tab, index) === identity
    );

    return tabIndex === -1 ? Math.max(fallbackTab, 0) : tabIndex;
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

    const tabTitles = tabs.map((tab) => tab.title);

    const hasContent = tabs.some((tab) => tab.content != null);

    const [currentIdentity, setCurrentIdentity] = useState<string>(() =>
        tabIdentity(tabs[activeTab], activeTab)
    );

    const currentTab = resolveIndexFromIdentity(
        currentIdentity,
        tabs,
        activeTab
    );

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

    const handleTabSelect = useCallback(
        (index: number) => {
            setCurrentIdentity(tabIdentity(tabs[index], index));
            updateUrlParam(index);
            onTabChange?.(index);
        },
        [onTabChange, tabs, updateUrlParam]
    );

    const handleParamChange = useCallback(() => {
        // Read the param imperatively, subscribing through useSearchParams()
        // in this component would opt every statically rendered page that
        // uses Tabs out of prerendering.
        const urlParam = new URLSearchParams(window.location.search).get(
            paramKey
        );

        const index = resolveTabFromParam(urlParam, tabs, activeTab);

        setCurrentIdentity(tabIdentity(tabs[index], index));
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

            <TabBar
                titles={tabTitles}
                activeIndex={currentTab}
                onTabSelect={handleTabSelect}
                className={buttonRowClassName}
            />

            {hasContent ? (
                <div className={'mt-3 min-h-16'}>
                    {tabs[currentTab]?.content}
                </div>
            ) : null}
        </div>
    );
};
