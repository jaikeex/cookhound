'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { chqc } from '@/client/request/queryClient';
import { deepClone } from '@/client/utils';
import { useAuth } from '@/client/store';
import type {
    DeleteShoppingListPayload,
    ShoppingListDTO,
    ShoppingListPayload
} from '@/common/types';
import { USER_QUERY_KEYS } from '@/client/request/queryClient/user';
import { usePathname } from 'next/navigation';

/**
 * A catch-all react hook for managing the shopping list.
 */
export const useShoppingList = () => {
    const { user } = useAuth();
    const userId = user?.id;
    const queryClient = useQueryClient();
    const pathname = usePathname();

    const listKey = useMemo(() => {
        return userId ? USER_QUERY_KEYS.shoppingList(userId) : undefined;
    }, [userId]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                          STATE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    const [editingShoppingList, setEditingShoppingList] = useState<
        ShoppingListDTO[] | null
    >(null);

    const startEditing = useCallback((current: ShoppingListDTO[]) => {
        // Work on a deep-cloned copy so we never mutate the cached data.
        setEditingShoppingList(deepClone(current));
    }, []);

    const updateEditingShoppingList = useCallback(
        (
            updater: (
                prev: ShoppingListDTO[] | null
            ) => ShoppingListDTO[] | null
        ) => {
            setEditingShoppingList((prev) => updater(prev));
        },
        []
    );

    //?—————————————————————————————————————————————————————————————————————————————————————————?//
    //?                                       QUERY STATE                                       ?//
    ///
    //# Using react-query as a state manager here. No other data state is kept anywhere
    //# (well, it is cached as well but that is part of RQ). Setting the data manually
    //# throughout the hook allows for a single source of truth across ALL callers
    //# of this hook. This was actually implemented as a zustand store before, but I like
    //# hooks more and once react-query was added to the project, it was an obvious use case.
    //#
    //# The disadvantage here is (as stated above) that the data needs to be updated manually,
    //# putting extra burden on the code inside this hook to do so.
    ///
    //?—————————————————————————————————————————————————————————————————————————————————————————?//

    // Central shopping list state
    const {
        data: shoppingListData,
        isFetching: isQueryLoading,
        error: queryError,
        refetch
    } = chqc.user.useShoppingList(userId ?? 0, {
        enabled: !!userId && pathname === '/shopping-list'
    });

    //~-----------------------------------------------------------------------------------------~//
    //$                                        MUTATIONS                                        $//
    //~-----------------------------------------------------------------------------------------~//

    const upsertMutation = chqc.user.useUpsertShoppingList(userId ?? 0, {
        onSuccess: (updated) => {
            if (listKey) {
                queryClient.setQueryData(listKey, updated);
            }
        }
    });

    const updateMutation = chqc.user.useUpdateShoppingList(userId ?? 0, {
        onSuccess: (updated) => {
            if (listKey) {
                queryClient.setQueryData(listKey, updated);
            }
        }
    });

    const deleteMutation = chqc.user.useDeleteShoppingList(userId ?? 0, {
        onMutate: async (payload) => {
            if (!listKey) return { previous: null };

            await queryClient.cancelQueries({ queryKey: listKey });

            const previous =
                queryClient.getQueryData<ShoppingListDTO[]>(listKey);

            let next: ShoppingListDTO[] = [];
            if (
                payload &&
                'recipeId' in payload &&
                payload.recipeId !== undefined
            ) {
                next = (previous ?? []).filter(
                    (entry) => entry.recipe.id !== payload.recipeId
                );
            }

            queryClient.setQueryData(listKey, next);

            return { previous } as {
                previous: ShoppingListDTO[] | undefined | null;
            };
        },
        onError: (_err, _payload, context) => {
            const ctx = context as
                | { previous?: ShoppingListDTO[] | null }
                | undefined;
            if (listKey && ctx?.previous) {
                queryClient.setQueryData(listKey, ctx.previous);
            }
        }
    });

    const isMutating = updateMutation.isPending || deleteMutation.isPending;

    const mutationError =
        upsertMutation.error || updateMutation.error || deleteMutation.error;

    //~-----------------------------------------------------------------------------------------~//
    //$                                         HOOK API                                        $//
    //~-----------------------------------------------------------------------------------------~//

    // Manually seeds the cache (typically from SSR data).
    const initialize = useCallback(
        (list: ShoppingListDTO[]) => {
            if (listKey) {
                queryClient.setQueryData(listKey, list);
            }
        },
        [queryClient, listKey]
    );

    const refreshShoppingList = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const createShoppingList = useCallback(
        async (list: ShoppingListPayload) => {
            await upsertMutation.mutateAsync(list);
        },
        [upsertMutation]
    );

    const deleteShoppingList = useCallback(async () => {
        await deleteMutation.mutateAsync({} as DeleteShoppingListPayload);
    }, [deleteMutation]);

    const deleteRecipeShoppingList = useCallback(
        async (recipeId: number) => {
            await deleteMutation.mutateAsync({ recipeId });
        },
        [deleteMutation]
    );

    const updateShoppingList = useCallback(
        async (updates: ShoppingListPayload[]) => {
            for (const update of updates) {
                await updateMutation.mutateAsync(update);
            }
        },
        [updateMutation]
    );

    const markIngredient = useCallback(
        async (recipeId: number, ingredientId: number) => {
            if (!listKey) return;

            const prev =
                queryClient.getQueryData<ShoppingListDTO[]>(listKey) ?? null;
            if (!prev) return;

            const optimistic = prev.map((entry) => {
                if (entry.recipe.id !== recipeId) return entry;

                const ingredient = entry.ingredients.find(
                    (ing) => ing.id === ingredientId
                );

                if (!ingredient) return entry;

                return {
                    ...entry,
                    ingredients: entry.ingredients.map((ing) =>
                        ing.id === ingredientId
                            ? { ...ing, marked: !ing.marked }
                            : ing
                    )
                };
            });

            queryClient.setQueryData(listKey, optimistic);

            const recipe = prev.find((entry) => entry.recipe.id === recipeId);

            if (!recipe) return;

            const ingredient = recipe.ingredients.find(
                (ing) => ing.id === ingredientId
            );

            if (!ingredient) return;

            const payload: ShoppingListPayload = {
                recipeId,
                ingredients: [
                    {
                        id: ingredient.id,
                        marked: !ingredient.marked,
                        quantity: ingredient.quantity
                    }
                ]
            };

            try {
                await upsertMutation.mutateAsync(payload);
            } catch {
                queryClient.setQueryData(listKey, prev);
            }
        },
        [upsertMutation, queryClient, listKey]
    );

    //~-----------------------------------------------------------------------------------------~//
    //$                                         RETURN                                          $//
    //~-----------------------------------------------------------------------------------------~//

    const isLoading = isQueryLoading || isMutating;
    const error = queryError ?? mutationError;

    return {
        shoppingList: shoppingListData ?? null,
        editingShoppingList,
        isLoading,
        error,

        initialize,
        startEditing,
        setEditingShoppingList,
        updateEditingShoppingList,

        refreshShoppingList,
        createShoppingList,
        deleteShoppingList,
        deleteRecipeShoppingList,
        updateShoppingList,
        markIngredient
    } as const;
};
