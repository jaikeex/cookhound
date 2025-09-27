'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { CookbookDTO } from '@/common/types';
import { DraggableGrid } from '@/client/components/molecules/List/DraggableGrid';
import {
    CookbookRecipeCard,
    RecipeCardList
} from '@/client/components/molecules';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import { useDebounce } from '@/client/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { GRID_COLS } from '@/client/constants';
import { useAuth } from '@/client/store';
import { Divider, Typography } from '@/client/components';

export type CookbookTemplateProps = Readonly<{
    cookbook: CookbookDTO;
}>;

export const CookbookTemplate: React.FC<CookbookTemplateProps> = ({
    cookbook
}) => {
    //|-----------------------------------------------------------------------------------------|//
    //?                                          STATE                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [order, setOrder] = useState<number[]>(
        cookbook?.recipes?.map((r) => r.id) ?? []
    );

    const isOwner = useMemo(
        () => user?.id === cookbook.ownerId,
        [user, cookbook]
    );

    // Map of recipe id -> recipe data for quick look-up when rendering in current order
    const recipesById = useMemo(() => {
        if (!cookbook.recipes) {
            return new Map<number, (typeof cookbook.recipes)[number]>();
        }

        const map = new Map<number, (typeof cookbook.recipes)[number]>();
        cookbook.recipes.forEach((recipe) => map.set(recipe.id, recipe));

        return map;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cookbook.recipes]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                  MUTATIONS & HANDLERS                                   ?//
    //|-----------------------------------------------------------------------------------------|//

    const { mutate: reorderRecipes } = chqc.cookbook.useReorderCookbookRecipes({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.cookbook.namespace]
            });
        }
    });

    const handleReorder = useCallback((oldIndex: number, newIndex: number) => {
        setOrder((prevState) => {
            if (oldIndex === newIndex) return prevState;

            const newState = [...prevState];
            const [moved] = newState.splice(oldIndex, 1);

            newState.splice(newIndex, 0, moved);

            return newState;
        });
    }, []);

    const handleRecipeRemoved = useCallback((removedId: number) => {
        setOrder((prev) => prev.filter((id) => id !== removedId));
    }, []);

    const debouncedOrder = useDebounce(order, 300);

    //|-----------------------------------------------------------------------------------------|//
    //?                                         EFFECTS                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    useEffect(() => {
        if (
            !debouncedOrder ||
            !Array.isArray(debouncedOrder) ||
            !cookbook.recipes
        ) {
            return;
        }

        if (
            debouncedOrder.length !== cookbook.recipes.length ||
            !debouncedOrder.every((id, idx) => id === cookbook.recipes[idx].id)
        ) {
            reorderRecipes({
                cookbookId: cookbook.id,
                orderedRecipeIds: debouncedOrder
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cookbook.id, debouncedOrder, reorderRecipes]);

    useEffect(() => {
        const recipeIds = Array.from(recipesById.keys());

        /*
         * If the number of recipes or the set of ids coming from the server no longer matches the local order
         * (e.g. another tab removed a recipe), reset order so the UI never renders an outdated list
         * that could break react-easy-sort from the inside.
         */
        if (
            recipeIds.length !== order.length ||
            !order.every((id) => recipesById.has(id))
        ) {
            setOrder(recipeIds);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipesById]);

    return (
        <section className="page-wrapper">
            <Typography variant="heading-md">{cookbook.title}</Typography>

            <Typography variant="body-sm" className="mt-2">
                {cookbook.description}
            </Typography>

            <Divider className="my-2" />

            {/* ensure grid col classes exist for tailwind */}
            <span className="hidden lg:grid-cols-3 xl:grid-cols-3" />

            {isOwner ? (
                <DraggableGrid
                    className={`grid ${GRID_COLS[2]} gap-4 md:${GRID_COLS[3]} lg:${GRID_COLS[4]} xl:${GRID_COLS[4]}`}
                    onReorder={handleReorder}
                >
                    {order.map((recipeId, index) => {
                        const recipe = recipesById.get(recipeId);
                        if (!recipe) {
                            return null;
                        }

                        return (
                            <CookbookRecipeCard
                                key={recipe.id}
                                cookbookId={cookbook.id}
                                id={recipe.id}
                                displayId={recipe.displayId}
                                title={recipe.title}
                                imageUrl={recipe.imageUrl}
                                rating={recipe.rating}
                                time={recipe.time}
                                portionSize={recipe.portionSize}
                                index={index}
                                onRemoved={handleRecipeRemoved}
                            />
                        );
                    })}
                </DraggableGrid>
            ) : (
                <RecipeCardList recipes={cookbook.recipes} hasMore={false} />
            )}
        </section>
    );
};
