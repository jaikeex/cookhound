'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
    ButtonBase,
    DraggableList,
    IngredientRowCreate,
    CategoryHeader
} from '@/client/components';
import type { Ingredient } from '@/common/types';
import { useLocale } from '@/client/store';

type IngredientsListCreateProps = Readonly<{
    defaultIngredients?: Ingredient[] | null;
    onChange?: (value: Ingredient[]) => void;
}>;

type IngredientByCategory = Map<string | null, Ingredient[]>;
type DragKeysByCategory = Map<string | null, number[]>;

export const IngredientsListCreate: React.FC<IngredientsListCreateProps> = ({
    defaultIngredients,
    onChange
}) => {
    //|-----------------------------------------------------------------------------------------|//
    //?                                          STATE                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const { t } = useLocale();

    const [categories, setCategories] = useState<string[]>([]);
    const [ingredientsByCategory, setIngredientsByCategory] =
        useState<IngredientByCategory>(
            new Map([
                [
                    null,
                    [{ name: '', quantity: null, category: null } as Ingredient]
                ]
            ])
        );

    const [dragKeysByCategory, setDragKeysByCategory] =
        useState<DragKeysByCategory>(new Map([[null, [0]]]));

    //|-----------------------------------------------------------------------------------------|//
    //?                                     INITIALIZATION                                      ?//
    //|-----------------------------------------------------------------------------------------|//

    useEffect(() => {
        if (!defaultIngredients || defaultIngredients.length === 0) return;

        const categoriesSet = new Set<string>();
        const categoryList: string[] = [];

        defaultIngredients.forEach((ing) => {
            if (ing.category && !categoriesSet.has(ing.category)) {
                categoriesSet.add(ing.category);
                categoryList.push(ing.category);
            }
        });

        const grouped = new Map<string | null, Ingredient[]>();
        grouped.set(null, []); //uncategorized

        categoryList.forEach((cat) => grouped.set(cat, []));

        defaultIngredients.forEach((ing) => {
            const category = ing.category || null;
            grouped.get(category)!.push(ing);
        });

        const dragKeys = new Map<string | null, number[]>();
        let globalIndex = 0;
        grouped.forEach((ingredients, cat) => {
            const keys = ingredients.map(() => globalIndex++);
            dragKeys.set(cat, keys);
        });

        setCategories(categoryList);
        setIngredientsByCategory(grouped);
        setDragKeysByCategory(dragKeys);
    }, [defaultIngredients]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                        INDEXING                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    const getGlobalIndex = useCallback(
        (categoryName: string | null, localIndex: number): number => {
            let globalIndex = 0;

            if (categoryName === null) {
                return localIndex;
            }

            globalIndex += (ingredientsByCategory.get(null) || []).length;

            for (const cat of categories) {
                if (cat === categoryName) {
                    return globalIndex + localIndex;
                }
                globalIndex += (ingredientsByCategory.get(cat) || []).length;
            }

            return globalIndex;
        },
        [categories, ingredientsByCategory]
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                         HANDLERS                                        ?//
    //|-----------------------------------------------------------------------------------------|//

    const notifyOnChange = useCallback(() => {
        const flat: Ingredient[] = [];

        // Uncategorized first
        const uncategorized = ingredientsByCategory.get(null) || [];
        flat.push(...uncategorized.map((ing) => ({ ...ing, category: null })));

        // Then rest in order
        categories.forEach((categoryName) => {
            const ingredients = ingredientsByCategory.get(categoryName) || [];
            flat.push(
                ...ingredients.map((ing) => ({
                    ...ing,
                    category: categoryName
                }))
            );
        });

        onChange?.(flat);
    }, [ingredientsByCategory, categories, onChange]);

    useEffect(() => {
        notifyOnChange();
    }, [notifyOnChange]);

    const handleAddCategory = useCallback(() => {
        let newName = t('app.recipe.section-title-default');
        let counter = 1;

        while (categories.includes(newName)) {
            counter++;
            newName = `${t('app.recipe.section-title-default')} ${counter}`;
        }

        setCategories((prev) => [...prev, newName]);
        setIngredientsByCategory((prev) => new Map(prev).set(newName, []));
        setDragKeysByCategory((prev) => new Map(prev).set(newName, []));
    }, [categories, t]);

    const handleRenameCategory = useCallback(
        (oldName: string, newName: string) => {
            setCategories((prev) =>
                prev.map((c) => (c === oldName ? newName : c))
            );

            setIngredientsByCategory((prev) => {
                const map = new Map(prev);
                const ingredients = map.get(oldName) || [];
                map.delete(oldName);
                map.set(
                    newName,
                    ingredients.map((ing) => ({ ...ing, category: newName }))
                );
                return map;
            });

            setDragKeysByCategory((prev) => {
                const map = new Map(prev);
                const keys = map.get(oldName) || [];
                map.delete(oldName);
                map.set(newName, keys);
                return map;
            });
        },
        []
    );

    const handleRemoveCategory = useCallback(
        (categoryName: string) => {
            const ingredients = ingredientsByCategory.get(categoryName) || [];

            if (ingredients.length > 0) {
                return;
            }

            setCategories((prev) => prev.filter((c) => c !== categoryName));

            setIngredientsByCategory((prev) => {
                const map = new Map(prev);
                map.delete(categoryName);
                return map;
            });

            setDragKeysByCategory((prev) => {
                const map = new Map(prev);
                map.delete(categoryName);
                return map;
            });
        },
        [ingredientsByCategory]
    );

    const handleAddIngredient = useCallback(
        (categoryName: string | null) => {
            setIngredientsByCategory((prev) => {
                const map = new Map(prev);
                const ingredients = map.get(categoryName) || [];
                map.set(categoryName, [
                    ...ingredients,
                    {
                        name: '',
                        quantity: null,
                        category: categoryName
                    } as Ingredient
                ]);
                return map;
            });

            setDragKeysByCategory((prev) => {
                const map = new Map(prev);
                const keys = map.get(categoryName) || [];
                const allKeys = Array.from(prev.values()).flat();
                const maxKey = allKeys.length > 0 ? Math.max(...allKeys) : 0;
                map.set(categoryName, [...keys, maxKey + 1]);
                return map;
            });

            /**
             * The autofocus on mobile is quite annoying, so it is disabled there for now.
             * Use lazy evaluation of window size to prevent re-renders on resize.
             */
            if (typeof window !== 'undefined' && window.innerWidth >= 1140) {
                // Calculate the global index for the new ingredient
                const currentIngredients =
                    ingredientsByCategory.get(categoryName) || [];

                const newLocalIndex = currentIngredients.length;

                const newGlobalIndex = getGlobalIndex(
                    categoryName,
                    newLocalIndex
                );

                // Focus the new ingredient
                setTimeout(() => {
                    const ingredient = document.getElementById(
                        'ingredient-name-' + newGlobalIndex
                    );
                    ingredient?.focus();
                }, 0);
            }
        },
        [ingredientsByCategory, getGlobalIndex]
    );

    const handleRemoveIngredient = useCallback(
        (
            categoryName: string | null,
            dragKey: number,
            ingredientIndex: number
        ) => {
            setIngredientsByCategory((prev) => {
                const map = new Map(prev);
                const ingredients = map.get(categoryName) || [];
                map.set(
                    categoryName,
                    ingredients.filter((_, idx) => idx !== ingredientIndex)
                );
                return map;
            });

            setDragKeysByCategory((prev) => {
                const map = new Map(prev);
                const keys = map.get(categoryName) || [];
                map.set(
                    categoryName,
                    keys.filter((k) => k !== dragKey)
                );
                return map;
            });
        },
        []
    );

    const handleIngredientChange = useCallback(
        (categoryName: string | null, index: number) =>
            (ingredient: Ingredient) => {
                setIngredientsByCategory((prev) => {
                    const map = new Map(prev);
                    const ingredients = map.get(categoryName) || [];
                    const updated = [...ingredients];
                    updated[index] = { ...ingredient, category: categoryName };
                    map.set(categoryName, updated);
                    return map;
                });
            },
        []
    );

    const handleReorder = useCallback(
        (categoryName: string | null) => (newOrder: number[]) => {
            setDragKeysByCategory((prev) => {
                const map = new Map(prev);
                map.set(categoryName, newOrder);
                return map;
            });

            setIngredientsByCategory((prev) => {
                const map = new Map(prev);
                const ingredients = map.get(categoryName) || [];
                const oldKeys = dragKeysByCategory.get(categoryName) || [];

                const keyToValue = new Map<number, Ingredient>();

                oldKeys.forEach((key, idx) => {
                    if (!ingredients[idx]) {
                        return;
                    }

                    keyToValue.set(key, ingredients[idx]);
                });

                const reordered = newOrder.map(
                    (key) =>
                        keyToValue.get(key) ||
                        ({
                            name: '',
                            quantity: null,
                            category: categoryName
                        } as Ingredient)
                );

                map.set(categoryName, reordered);

                return map;
            });
        },
        [dragKeysByCategory]
    );

    const createCategoryRemoveHandler = useCallback(
        (categoryName: string) => () => handleRemoveCategory(categoryName),
        [handleRemoveCategory]
    );

    const createIngredientAddHandler = useCallback(
        (categoryName: string | null) => () =>
            handleAddIngredient(categoryName),
        [handleAddIngredient]
    );

    const createIngredientRemoveHandler = useCallback(
        (categoryName: string | null, key: number, index: number) => () =>
            handleRemoveIngredient(categoryName, key, index),
        [handleRemoveIngredient]
    );

    const handleAddUncategorizedIngredient = useCallback(
        () => handleAddIngredient(null),
        [handleAddIngredient]
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                          RENDER                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    const renderCategorySection = useCallback(
        (categoryName: string | null) => {
            const ingredients = ingredientsByCategory.get(categoryName) || [];
            const dragKeys = dragKeysByCategory.get(categoryName) || [];
            const isUncategorized = categoryName === null;
            const canRemoveCategory =
                !isUncategorized && ingredients.length === 0;

            if (ingredients.length === 0 && isUncategorized) {
                return null; // Don't render empty uncategorized section
            }

            const handleCategoryRemove =
                !isUncategorized && categoryName
                    ? createCategoryRemoveHandler(categoryName)
                    : undefined;

            const handleReorderCategory = handleReorder(categoryName);
            const handleAddIngredientToCategory =
                createIngredientAddHandler(categoryName);

            return (
                <div
                    key={categoryName || 'uncategorized'}
                    className="space-y-2"
                >
                    {!isUncategorized && categoryName && (
                        <CategoryHeader
                            categoryName={categoryName}
                            ingredientCount={ingredients.length}
                            canRemove={canRemoveCategory}
                            onRename={handleRenameCategory}
                            onRemove={handleCategoryRemove}
                            existingCategoryNames={categories}
                        />
                    )}

                    {ingredients.length > 0 && (
                        <DraggableList
                            onReorder={handleReorderCategory}
                            values={dragKeys}
                        >
                            {dragKeys.map((key, localIndex) => {
                                const globalIndex = getGlobalIndex(
                                    categoryName,
                                    localIndex
                                );
                                const handleChange = handleIngredientChange(
                                    categoryName,
                                    localIndex
                                );
                                const handleRemove =
                                    createIngredientRemoveHandler(
                                        categoryName,
                                        key,
                                        localIndex
                                    );

                                return (
                                    <IngredientRowCreate
                                        key={key}
                                        dragIndex={key}
                                        index={globalIndex}
                                        category={categoryName}
                                        defaultIngredient={
                                            ingredients[localIndex]
                                        }
                                        onAddIngredient={
                                            handleAddIngredientToCategory
                                        }
                                        onChange={handleChange}
                                        onRemove={handleRemove}
                                    />
                                );
                            })}
                        </DraggableList>
                    )}

                    {!isUncategorized && (
                        <ButtonBase
                            className="w-full"
                            color="subtle"
                            icon="plus"
                            onClick={handleAddIngredientToCategory}
                            size="sm"
                        >
                            {t('app.recipe.add-ingredient')}
                        </ButtonBase>
                    )}
                </div>
            );
        },
        [
            categories,
            ingredientsByCategory,
            dragKeysByCategory,
            handleRenameCategory,
            createCategoryRemoveHandler,
            handleReorder,
            createIngredientAddHandler,
            handleIngredientChange,
            createIngredientRemoveHandler,
            getGlobalIndex,
            t
        ]
    );

    const renderSections = useMemo(
        () => (
            <>
                {renderCategorySection(null)}
                <ButtonBase
                    className="w-full"
                    color="subtle"
                    icon="plus"
                    onClick={handleAddUncategorizedIngredient}
                    size="sm"
                >
                    {t('app.recipe.add-ingredient')}
                </ButtonBase>

                {categories.map((categoryName) =>
                    renderCategorySection(categoryName)
                )}
            </>
        ),
        [categories, handleAddUncategorizedIngredient, renderCategorySection, t]
    );

    return (
        <div className="space-y-6">
            {renderSections}

            <ButtonBase
                className="w-full"
                color="subtle"
                icon="plus"
                onClick={handleAddCategory}
                size="sm"
                outlined
            >
                {t('app.recipe.add-section')}
            </ButtonBase>
        </div>
    );
};
