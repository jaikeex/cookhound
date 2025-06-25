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
        <div className="flex flex-col max-w-screen-sm gap-4 px-2 mx-auto mt-32 md:max-w-screen-md xl:max-w-screen-lg md:mt-36">
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
