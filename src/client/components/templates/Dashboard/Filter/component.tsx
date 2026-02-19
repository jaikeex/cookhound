'use client';

import React, { useCallback, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
    Banner,
    RecipeCardList,
    Typography,
    RecipeFilters,
    SkeletonCard
} from '@/client/components';
import type { RecipeFilterParams } from '@/common/types';
import { useRecipeFilters } from '@/client/hooks';
import { useLocale } from '@/client/store';
import { useRouter } from 'next/navigation';
import { GRID_COLS } from '@/client/constants';

type FilterTemplateProps = Readonly<{
    initialFilters?: RecipeFilterParams;
}>;

export const FilterTemplate: React.FC<FilterTemplateProps> = ({
    initialFilters = {}
}) => {
    const { t } = useLocale();
    const router = useRouter();

    const [searchInput, setSearchInput] = useState<string>('');

    const {
        recipes,
        filters,
        hasMore,
        isLoading,
        isFetching,
        updateFilter,
        clearFilters,
        loadMore
    } = useRecipeFilters(initialFilters);

    const handleSearchInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setSearchInput(e.target.value);
        },
        []
    );

    const executeSearch = useCallback(() => {
        const trimmed = searchInput.trim();
        if (!trimmed) return;

        router.push(`/search?query=${encodeURIComponent(trimmed)}`);
    }, [searchInput, router]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                          RENDER                                         $//
    //~-----------------------------------------------------------------------------------------~//

    const Skeleton = useMemo(() => {
        const gridCols = {
            sm: GRID_COLS[2],
            md: GRID_COLS[2],
            lg: GRID_COLS[3],
            xl: GRID_COLS[3]
        };

        const classes = `grid ${gridCols.sm} gap-4 md:${gridCols.md} lg:${gridCols.lg} xl:${gridCols.xl}`;

        const skeletonCards = Array.from({ length: 12 }, (_, index) => (
            <SkeletonCard key={index} />
        ));

        return <div className={classes}>{skeletonCards}</div>;
    }, []);

    return (
        <div className="page-wrapper flex flex-col gap-4 mt-36 md:mt-40">
            <Banner
                onChange={handleSearchInputChange}
                onSearch={executeSearch}
                isLoading={false}
                hideFiltersLink
            />

            <div className="flex flex-col lg:flex-row gap-6">
                <aside>
                    <RecipeFilters
                        className="w-full lg:w-72 shrink-0 flex flex-col gap-5"
                        clearFilters={clearFilters}
                        filters={filters}
                        updateFilter={updateFilter}
                    />
                </aside>

                <div className="flex-1 min-w-0">
                    {isLoading && recipes.length === 0 ? (
                        Skeleton
                    ) : recipes.length > 0 ? (
                        <RecipeCardList
                            cols={{
                                sm: GRID_COLS[2] ?? 'grid-cols-2',
                                md: GRID_COLS[2] ?? 'grid-cols-2',
                                lg: GRID_COLS[3] ?? 'grid-cols-3',
                                xl: GRID_COLS[3] ?? 'grid-cols-3'
                            }}
                            recipes={recipes}
                            loadMore={loadMore}
                            hasMore={hasMore}
                            isLoading={isFetching}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full h-64">
                            <Typography
                                variant="heading-md"
                                className="text-center"
                            >
                                {t('app.general.search-no-results')}
                            </Typography>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
