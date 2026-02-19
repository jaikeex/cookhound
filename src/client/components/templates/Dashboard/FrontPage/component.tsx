'use client';

import React, { use, useCallback, useState } from 'react';
import type { RecipeForDisplayDTO } from '@/common/types';
import { Banner, RecipeCardList } from '@/client/components';
import { useRecipeDiscovery } from '@/client/hooks';
import { useRouter } from 'next/navigation';

type FrontPageProps = Readonly<{
    initialRecipes: Promise<RecipeForDisplayDTO[]>;
}>;

export const FrontPageTemplate: React.FC<FrontPageProps> = ({
    initialRecipes
}) => {
    const resolvedRecipes = use(initialRecipes);

    const { recipes, loadMore, hasMore, isLoading } =
        useRecipeDiscovery(resolvedRecipes);

    const [searchQuery, setSearchQuery] = useState<string>('');
    const router = useRouter();

    const executeSearch = useCallback(() => {
        const trimmed = searchQuery.trim();
        if (!trimmed) return;

        router.push(`/search?query=${encodeURIComponent(trimmed)}`);
    }, [searchQuery, router]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(e.target.value);
        },
        []
    );

    return (
        <div className="page-wrapper flex flex-col gap-4 mt-36 md:mt-40">
            <Banner
                onChange={handleInputChange}
                onSearch={executeSearch}
                isLoading={false}
            />

            <RecipeCardList
                recipes={recipes}
                loadMore={loadMore}
                hasMore={hasMore}
                isLoading={isLoading}
            />
        </div>
    );
};
