'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type {
    Ingredient,
    ShoppingListDTO,
    ShoppingListIngredientDTO,
    ShoppingListPayload
} from '@/common/types';
import {
    ButtonBase,
    ShoppingListBody,
    ShoppingListHead,
    Trash,
    Typography
} from '@/client/components';
import { useAuth, useLocale, useModal } from '@/client/store';
import { useShoppingList } from '@/client/hooks';
import Link from 'next/link';

type ShoppingListTemplateProps = Readonly<{
    initialData: ShoppingListDTO[];
}>;

export const ShoppingListTemplate: React.FC<ShoppingListTemplateProps> = ({
    initialData
}) => {
    //|-----------------------------------------------------------------------------------------|//
    //?                                          SETUP                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const { user } = useAuth();
    const { openModal } = useModal();
    const { t } = useLocale();

    const {
        shoppingList,
        editingShoppingList,
        isLoading,
        ...shoppingListStore
    } = useShoppingList();

    const isEmpty = initialData.length === 0;
    const data = shoppingList ? shoppingList : initialData;

    const [isEditing, setIsEditing] = useState(false);

    const [binIngredients, setBinIngredients] = useState<
        ShoppingListIngredientDTO[]
    >([]);

    const binRef = useRef<HTMLDivElement | null>(null);
    const recipeRefs = useRef<Record<number, HTMLDivElement | null>>({});

    useEffect(() => {
        if (isEmpty || shoppingList !== null) return;
        shoppingListStore.initialize(initialData);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                         EDITING                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    const handleEdit = useCallback(async () => {
        if (!user) return;

        if (!isEditing) {
            // Put the list into edit mode.
            // Set all state necessary for editing here.
            shoppingListStore.startEditing(data);
            setBinIngredients([]);
            setIsEditing(true);
            return;
        }

        if (!editingShoppingList) {
            setIsEditing(false);
            return;
        }

        /**
         * This is where the updated list is processed and submitted.
         */

        const payloads: ShoppingListPayload[] = editingShoppingList.map(
            (entry) => ({
                recipeId: entry.recipe.id,
                ingredients: entry.ingredients.map((ing) => ({
                    id: ing.id,
                    marked: ing.marked,
                    quantity: ing.quantity
                }))
            })
        );

        await shoppingListStore.updateShoppingList(payloads);

        shoppingListStore.setEditingShoppingList(null);
        setBinIngredients([]);
        setIsEditing(false);
    }, [isEditing, editingShoppingList, shoppingListStore, user, data]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                         MARKING                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    const handleMarkIngredient = useCallback(
        (recipeId: number) => async (ingredient: Ingredient) => {
            if (!user) return;

            try {
                const isIngredientCurrentlyMarked = isIngredientMarked(
                    recipeId,
                    ingredient.id,
                    shoppingList
                );

                if (isIngredientCurrentlyMarked === true || isEditing) return;

                shoppingListStore.markIngredient(recipeId, ingredient.id);
            } catch {
                // If something above throws, the list is probably fucked. Do nothing in that case
                return;
            }
        },
        [shoppingListStore, shoppingList, isEditing, user]
    );

    const handleUnmarkIngredient = useCallback(
        (recipeId: number) => async (ingredient: Ingredient) => {
            if (!user) return;

            try {
                const isIngredientCurrentlyMarked = isIngredientMarked(
                    recipeId,
                    ingredient.id,
                    shoppingList
                );

                if (isIngredientCurrentlyMarked === false || isEditing) return;

                shoppingListStore.markIngredient(recipeId, ingredient.id);
            } catch {
                // If something above throws, the list is probably fucked. Do nothing in that case
                return;
            }
        },
        [shoppingListStore, shoppingList, isEditing, user]
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                    DELETE RECIPE LIST                                   ?//
    //|-----------------------------------------------------------------------------------------|//

    const handleDeleteRecipeShoppingList = useCallback(
        (recipeId: number, close: () => void) => () => {
            if (!user || isEditing) return;

            close();
            shoppingListStore.deleteRecipeShoppingList(recipeId);
        },
        [shoppingListStore, isEditing, user]
    );

    const getModalContent = useCallback(
        (recipeId: number) => (close: () => void) => {
            return (
                <div className="flex flex-col items-center w-full h-full gap-4">
                    <Typography variant="body" className="text-center">
                        {t('app.shopping-list.delete-recipe-shopping-list')}
                    </Typography>

                    <div className="flex w-full gap-3 mt-4">
                        <ButtonBase
                            color="subtle"
                            outlined
                            size="md"
                            className="w-full"
                            onClick={close}
                        >
                            {t('app.general.cancel')}
                        </ButtonBase>
                        <ButtonBase
                            color="primary"
                            size="md"
                            className="w-full"
                            onClick={handleDeleteRecipeShoppingList(
                                recipeId,
                                close
                            )}
                        >
                            {t('app.general.confirm')}
                        </ButtonBase>
                    </div>
                </div>
            );
        },
        [handleDeleteRecipeShoppingList, t]
    );

    const openConfirmDeleteModal = useCallback(
        (recipeId: number) => () => {
            if (isEditing) return;

            openModal(getModalContent(recipeId), {
                hideCloseButton: true
            });
        },
        [getModalContent, openModal, isEditing]
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                       DRAG LOGIC                                       ?//
    //|-----------------------------------------------------------------------------------------|//

    const createRecipeRefCallback = useCallback(
        (recipeId: number) => (node: HTMLDivElement | null) => {
            recipeRefs.current[recipeId] = node;
        },
        []
    );

    const handleReorder = useCallback(
        (recipeId: number) => (newOrder: number[]) => {
            if (!editingShoppingList) return;

            shoppingListStore.updateEditingShoppingList((prev) => {
                if (!prev) return prev;

                return prev.map((entry) => {
                    if (entry.recipe.id !== recipeId) return entry;

                    const reorderedIngredients = newOrder
                        .map((id) => entry.ingredients.find((i) => i.id === id))
                        .filter(Boolean) as ShoppingListIngredientDTO[];

                    return { ...entry, ingredients: reorderedIngredients };
                });
            });
        },
        [editingShoppingList, shoppingListStore]
    );

    const createIngredientDragEnd = useCallback(
        (ingredient: ShoppingListIngredientDTO, recipeId: number) =>
            (event: PointerEvent) => {
                if (!isEditing || !binRef.current) return;

                const x = event.clientX;
                const y = event.clientY;

                const binRect = binRef.current.getBoundingClientRect();

                if (
                    x >= binRect.left &&
                    x <= binRect.right &&
                    y >= binRect.top &&
                    y <= binRect.bottom
                ) {
                    /**
                     * The item was dropped inside the trash area. remove it from the edit store
                     * and add it to the bin state.
                     */
                    shoppingListStore.updateEditingShoppingList((prev) => {
                        if (!prev) return prev;

                        return prev.map((entry) => {
                            if (entry.recipe.id !== recipeId) return entry;

                            return {
                                ...entry,
                                ingredients: entry.ingredients.filter(
                                    (i) => i.id !== ingredient.id
                                )
                            };
                        });
                    });

                    setBinIngredients((prev) => {
                        if (prev.some((i) => i.id === ingredient.id)) {
                            return prev;
                        }
                        return [...prev, ingredient];
                    });

                    return;
                }

                const recipeRect =
                    recipeRefs.current[recipeId]?.getBoundingClientRect();

                if (
                    recipeRect &&
                    x >= recipeRect.left &&
                    x <= recipeRect.right &&
                    y >= recipeRect.top &&
                    y <= recipeRect.bottom
                ) {
                    // If ingredient currently in trash, restore
                    if (binIngredients.some((i) => i.id === ingredient.id)) {
                        setBinIngredients((prev) =>
                            prev.filter((i) => i.id !== ingredient.id)
                        );

                        shoppingListStore.updateEditingShoppingList((prev) => {
                            if (!prev) return prev;

                            return prev.map((entry) => {
                                if (entry.recipe.id !== recipeId) return entry;

                                return {
                                    ...entry,
                                    ingredients: [
                                        ...entry.ingredients,
                                        ingredient
                                    ]
                                };
                            });
                        });
                    }
                }
            },
        [isEditing, shoppingListStore, binIngredients]
    );

    const handleIngredientDragEnd = useCallback(
        (recipeId: number) => (ingredient: ShoppingListIngredientDTO) =>
            createIngredientDragEnd(ingredient, recipeId),
        [createIngredientDragEnd]
    );

    /**
     * Implementing reordering of the trash was (believe it or not) easier than learning framer-motion
     * and finding a way to keep the state synced.
     */
    const handleBinReorder = useCallback((newOrder: number[]) => {
        setBinIngredients((prev) => {
            return newOrder
                .map((id) => prev.find((i) => i.id === id))
                .filter(Boolean) as ShoppingListIngredientDTO[];
        });
    }, []);

    //|-----------------------------------------------------------------------------------------|//
    //?                                       EMPTY STATE                                       ?//
    //|-----------------------------------------------------------------------------------------|//

    if (
        (isEmpty && !isEditing && shoppingList === null) ||
        (shoppingList && shoppingList.length === 0)
    ) {
        return (
            <div className="max-w-md pt-20 mx-auto min-w-72">
                <Typography variant="heading-md" className="text-center">
                    {t('app.shopping-list.empty')}
                </Typography>
                <Link href="/">
                    <ButtonBase
                        color="primary"
                        size="md"
                        className="w-full mt-8"
                    >
                        {t('app.general.home')}
                    </ButtonBase>
                </Link>
            </div>
        );
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                         RENDER                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    return (
        <div className="max-w-md px-4 mx-auto min-w-72">
            <ShoppingListHead
                editing={isEditing}
                loading={isLoading}
                onEdit={handleEdit}
            />

            {(isEditing ? (editingShoppingList ?? []) : data).map((list) => (
                <ShoppingListBody
                    key={list.recipe.displayId}
                    list={list}
                    editing={isEditing}
                    onDelete={openConfirmDeleteModal(list.recipe.id)}
                    ref={createRecipeRefCallback(list.recipe.id)}
                    onReorder={handleReorder(list.recipe.id)}
                    onIngredientDragEnd={handleIngredientDragEnd(
                        list.recipe.id
                    )}
                    onMark={handleMarkIngredient(list.recipe.id)}
                    onUnMark={handleUnmarkIngredient(list.recipe.id)}
                />
            ))}

            {isEditing ? (
                <Trash
                    ref={binRef}
                    ingredients={binIngredients}
                    onReorder={handleBinReorder}
                    onDragEnd={createIngredientDragEnd}
                />
            ) : null}
        </div>
    );
};

function isIngredientMarked(
    recipeId: number,
    ingredientId: number,
    shoppingList: ShoppingListDTO[] | null
) {
    if (!shoppingList) throw new Error('No shopping list.');

    const currentList = shoppingList?.find(
        (l) => l.recipe.id === recipeId
    )?.ingredients;

    if (!currentList) throw new Error('No current list.');

    const currentIngredient = currentList.find((i) => i.id === ingredientId);

    if (!currentIngredient) throw new Error('No ingredient.');

    return currentIngredient.marked;
}
