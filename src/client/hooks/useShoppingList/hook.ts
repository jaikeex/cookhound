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

    const listQueryKey = useMemo(() => {
        return userId ? USER_QUERY_KEYS.shoppingList(userId) : undefined;
    }, [userId]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                          STATE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    const [editingShoppingList, setEditingShoppingList] = useState<
        ShoppingListDTO[] | null
    >(null);

    const startEditing = useCallback((current: ShoppingListDTO[]) => {
        // Always work on a deep-cloned copy.
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
        onMutate: async (payload) => {
            // The following code deals with optimistically updating the ui while trying not to fuck everything up.
            if (!listQueryKey) return { previous: null } as const;

            //§ Cancel outgoing fetches so they don’t mess up the optimistic update - THIS IS IMPORTANT
            await queryClient.cancelQueries({ queryKey: listQueryKey });

            const previous =
                queryClient.getQueryData<ShoppingListDTO[]>(listQueryKey);

            // If there is no payload or previous data, just return rollback context
            if (!payload || !previous) return { previous } as const;

            // Build the optimistic version of the list here
            const next = previous.map((entry) => {
                if (entry.recipe.id !== payload.recipeId) return entry;

                const updatedIngredients = entry.ingredients.map((ing) => {
                    const update = payload.ingredients.find(
                        (u) => u.id === ing.id
                    );
                    return update
                        ? {
                              ...ing,
                              marked: update.marked,
                              quantity: update.quantity
                          }
                        : ing;
                });

                return { ...entry, ingredients: updatedIngredients };
            });

            queryClient.setQueryData(listQueryKey, next);

            // Provide rollback context
            return { previous } as const;
        },

        //§ NEVER overwrite the cache here with possibly stale server response
        onSuccess: () => {
            if (listQueryKey) {
                // Refetch once to ensure the cache is in sync with the server
                queryClient.invalidateQueries({ queryKey: listQueryKey });
            }
        },

        // Rollback everything on error
        onError: (_err, _payload, ctx) => {
            const context = ctx as
                | { previous?: ShoppingListDTO[] | null }
                | undefined;

            if (listQueryKey && context?.previous) {
                queryClient.setQueryData(listQueryKey, context.previous);
            }
        }
    });

    // Update mutation – simpler optimistic path handled in onMutate (same pattern as above)
    const updateMutation = chqc.user.useUpdateShoppingList(userId ?? 0, {
        onMutate: async (payload) => {
            // The following code deals with optimistically updating the ui while trying not to fuck everything up.
            // Same pattern and priciples as above apply here
            if (!listQueryKey) return { previous: null } as const;

            //§ Cancel outgoing fetches so they don’t mess up the optimistic update - THIS IS IMPORTANT
            await queryClient.cancelQueries({ queryKey: listQueryKey });

            const previous =
                queryClient.getQueryData<ShoppingListDTO[]>(listQueryKey);

            // If there is no payload or previous data, just return rollback context
            if (!payload || !previous) return { previous } as const;

            // Merge the update into the cache optimistically
            const next = previous.map((entry) => {
                if (entry.recipe.id !== payload.recipeId) return entry;

                const updatedIngredients = entry.ingredients.map((ing) => {
                    const update = payload.ingredients.find(
                        (u) => u.id === ing.id
                    );
                    return update ? { ...ing, ...update } : ing;
                });

                return { ...entry, ingredients: updatedIngredients };
            });

            queryClient.setQueryData(listQueryKey, next);
            return { previous } as const;
        },
        onSuccess: () => {
            if (listQueryKey) {
                queryClient.invalidateQueries({ queryKey: listQueryKey });
            }
        },
        onError: (_err, _payload, ctx) => {
            const context = ctx as
                | { previous?: ShoppingListDTO[] | null }
                | undefined;

            if (listQueryKey && context?.previous) {
                queryClient.setQueryData(listQueryKey, context.previous);
            }
        }
    });

    const deleteMutation = chqc.user.useDeleteShoppingList(userId ?? 0, {
        onMutate: async (payload) => {
            if (!listQueryKey) return { previous: null };

            await queryClient.cancelQueries({ queryKey: listQueryKey });

            const previous =
                queryClient.getQueryData<ShoppingListDTO[]>(listQueryKey);

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

            queryClient.setQueryData(listQueryKey, next);

            return { previous } as {
                previous: ShoppingListDTO[] | undefined | null;
            };
        },
        onError: (_err, _payload, context) => {
            const ctx = context as
                | { previous?: ShoppingListDTO[] | null }
                | undefined;

            if (listQueryKey && ctx?.previous) {
                queryClient.setQueryData(listQueryKey, ctx.previous);
            }
        }
    });

    const isMutating =
        upsertMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending;

    const mutationError =
        upsertMutation.error || updateMutation.error || deleteMutation.error;

    //~-----------------------------------------------------------------------------------------~//
    //$                                         HOOK API                                        $//
    //~-----------------------------------------------------------------------------------------~//

    // Manually seeds the cache (typically from SSR data).
    const initialize = useCallback(
        (list: ShoppingListDTO[]) => {
            if (listQueryKey) {
                queryClient.setQueryData(listQueryKey, list);
            }
        },
        [queryClient, listQueryKey]
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

    //? Guard against double-clicks on the same ingredient while a mutation is in flight by keeping a Set of pending toggles.
    const [pendingToggles, setPendingToggles] = useState<Set<string>>(
        new Set()
    );

    const markIngredient = useCallback(
        async (recipeId: number, ingredientId: number) => {
            if (!listQueryKey) return;

            const toggleKey = `${recipeId}-${ingredientId}`;
            if (pendingToggles.has(toggleKey)) return; // ignore rapid repeat

            setPendingToggles((prev) => new Set(prev).add(toggleKey));

            const payload: ShoppingListPayload = {
                recipeId,
                ingredients: [
                    {
                        id: ingredientId,
                        // The optimistic update flips the value, so a simple invert here is everything thats needed.
                        marked: !(
                            queryClient
                                .getQueryData<ShoppingListDTO[]>(listQueryKey)
                                ?.find((e) => e.recipe.id === recipeId)
                                ?.ingredients.find((i) => i.id === ingredientId)
                                ?.marked ?? false
                        ),
                        quantity:
                            queryClient
                                .getQueryData<ShoppingListDTO[]>(listQueryKey)
                                ?.find((e) => e.recipe.id === recipeId)
                                ?.ingredients.find((i) => i.id === ingredientId)
                                ?.quantity ?? null
                    }
                ]
            };

            await upsertMutation.mutateAsync(payload).finally(() => {
                setPendingToggles((prev) => {
                    const next = new Set(prev);
                    next.delete(toggleKey);
                    return next;
                });
            });
        },
        [upsertMutation, listQueryKey, queryClient, pendingToggles]
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
