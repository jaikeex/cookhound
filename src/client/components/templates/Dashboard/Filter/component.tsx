'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Banner } from '@/client/components/organisms/Banner';
import { RecipeCardList } from '@/client/components/molecules/List/RecipeCardList';
import { Typography } from '@/client/components/atoms/Typography';
import { RecipeFilters } from '@/client/components/organisms/Filter/RecipeFilters';
import { SkeletonCard } from '@/client/components/atoms/Skeleton/SkeletonCard';
import type { RecipeFilterParams } from '@/common/types';
import { useRecipeFilters } from '@/client/hooks';
import { useRouter } from 'next/navigation';
import { GRID_COLS } from '@/client/constants';
import { serializeFilterParams } from '@/common/utils';
import { ROUTES } from '@/common/constants';
import { t } from '@/client/locales';

type FilterTemplateProps = Readonly<{
    initialFilters?: RecipeFilterParams;
}>;

export const FilterTemplate: React.FC<FilterTemplateProps> = ({
    initialFilters = {}
}) => {
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

        router.push(ROUTES.search(trimmed));
    }, [searchInput, router]);

    /**
     * This should be considered the only source of truth for the filter params router updates.
     * Packaging this with the handlers causes issues with batched updates and can lead to
     * incosistent states...
     * Also, this always results in a router call on first mount, but should be no concern.
     * The serialized url will be the same as the current one.
     */
    useEffect(() => {
        const params = serializeFilterParams(filters);
        const search = params.toString();

        router.replace(search ? `${ROUTES.filter}?${search}` : ROUTES.filter, {
            scroll: false
        });
        // this is intentional
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                          RENDER                                         $//
    //~-----------------------------------------------------------------------------------------~//

    const createSkeleton = () => {
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
    };

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
                        createSkeleton()
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
                                as="h2"
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
