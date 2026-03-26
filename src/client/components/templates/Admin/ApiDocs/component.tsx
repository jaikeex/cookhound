'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { ChipButton, Typography } from '@/client/components';
import { useLocale } from '@/client/store/I18nContext';
import type { SerializedRouteDoc } from '@/common/types';
import { CategoryChipButton } from './CategoryChipButton';
import { EndpointCard } from './EndpointCard';

export type AdminApiDocsTemplateProps = Readonly<{
    data: SerializedRouteDoc[];
}>;

export const AdminApiDocsTemplate: React.FC<AdminApiDocsTemplateProps> = ({
    data
}) => {
    const { t } = useLocale();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const categories = useMemo(
        () => [...new Set(data.map((r) => r.category))].sort(),
        [data]
    );

    const endpointCount = useMemo(
        () => data.reduce((sum, r) => sum + r.endpoints.length, 0),
        [data]
    );

    const filtered = useMemo(() => {
        const query = search.toLowerCase().trim();

        return data.filter((route) => {
            if (activeCategory && route.category !== activeCategory) {
                return false;
            }

            if (!query) {
                return true;
            }

            return (
                route.path.toLowerCase().includes(query) ||
                route.subcategory?.toLowerCase().includes(query) ||
                route.endpoints.some(
                    (e) =>
                        e.summary.toLowerCase().includes(query) ||
                        e.clientUsage?.some(
                            (u) =>
                                u.hook.toLowerCase().includes(query) ||
                                u.apiClient.toLowerCase().includes(query)
                        )
                )
            );
        });
    }, [data, search, activeCategory]);

    const grouped = useMemo(() => {
        const map = new Map<string, Map<string | null, SerializedRouteDoc[]>>();

        for (const route of filtered) {
            let categoryMap = map.get(route.category);

            if (!categoryMap) {
                categoryMap = new Map();
                map.set(route.category, categoryMap);
            }

            const subKey = route.subcategory ?? null;
            const categoryArray = categoryMap.get(subKey) ?? [];

            categoryArray.push(route);
            categoryMap.set(subKey, categoryArray);
        }

        return map;
    }, [filtered]);

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
        },
        []
    );

    const handleClearCategory = useCallback(() => {
        setActiveCategory(null);
    }, []);

    const handleCategoryClick = useCallback((category: string | null) => {
        setActiveCategory(category);
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Typography variant="heading-lg">
                    {t('admin.apiDocs.title')}
                </Typography>

                <Typography variant="body-xs" className="mt-1 text-gray-500">
                    {data.length} {t('admin.apiDocs.routes')} &middot;{' '}
                    {endpointCount} {t('admin.apiDocs.endpoints')}
                </Typography>
            </div>

            <div className="flex flex-col gap-3">
                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder={t('admin.apiDocs.search.placeholder')}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-sheet px-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 md:max-w-sm"
                />

                <div className="flex flex-wrap gap-2">
                    <ChipButton
                        color={!activeCategory ? 'primary' : 'subtle'}
                        outlined={!!activeCategory}
                        size="sm"
                        onClick={handleClearCategory}
                    >
                        {t('admin.apiDocs.filter.all')}
                    </ChipButton>

                    {categories.map((category) => (
                        <CategoryChipButton
                            key={category}
                            category={category}
                            isActive={activeCategory === category}
                            onClick={handleCategoryClick}
                        />
                    ))}
                </div>
            </div>

            {grouped.size === 0 ? (
                <Typography variant="body-sm" className="text-gray-500">
                    {t('admin.apiDocs.noResults')}
                </Typography>
            ) : (
                [...grouped.entries()].map(([category, subMap]) => (
                    <section key={category}>
                        <Typography variant="heading-sm" className="mb-3">
                            {category}
                        </Typography>

                        {[...subMap.entries()]
                            .sort(([a], [b]) =>
                                (a ?? '').localeCompare(b ?? '')
                            )
                            .map(([subcategory, routes]) => (
                                <div
                                    key={subcategory ?? '__root'}
                                    className="mb-3 flex flex-col gap-2"
                                >
                                    {subcategory ? (
                                        <Typography
                                            variant="body-sm"
                                            className="ml-1 mt-2 font-medium text-gray-500"
                                        >
                                            {subcategory}
                                        </Typography>
                                    ) : null}

                                    {routes.flatMap((route) =>
                                        route.endpoints.map((endpoint) => (
                                            <EndpointCard
                                                key={`${route.path}-${endpoint.method}`}
                                                path={route.path}
                                                endpoint={endpoint}
                                            />
                                        ))
                                    )}
                                </div>
                            ))}
                    </section>
                ))
            )}
        </div>
    );
};
