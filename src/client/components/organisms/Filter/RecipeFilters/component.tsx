'use client';

import {
    RangeSlider,
    Typography,
    ButtonBase,
    ChipButton,
    FilterTagSelectionModal,
    FormCheckbox,
    IngredientFilterInput
} from '@/client/components';
import { chqc } from '@/client/request/queryClient';
import { useLocale, useModal, useSnackbar } from '@/client/store';
import { generateRandomId } from '@/client/utils';
import type {
    RecipeFilterParams,
    IngredientDTO,
    RecipeTagDTO
} from '@/common/types';
import React, { useCallback, useMemo, useState } from 'react';

export type RecipeFiltersProps = Readonly<{
    className?: string;
    clearFilters: () => void;
    filters: RecipeFilterParams;
    updateFilter: <K extends keyof RecipeFilterParams>(
        key: K,
        value: RecipeFilterParams[K]
    ) => void;
}>;

const MAX_TIME_MINUTES = 240;

export const RecipeFilters: React.FC<RecipeFiltersProps> = ({
    className,
    clearFilters,
    filters,
    updateFilter
}) => {
    const { locale, t } = useLocale();
    const { openModal } = useModal();
    const { alert } = useSnackbar();

    const [controlKey, setControlKey] = useState<string>(generateRandomId(6));

    const handleClear = useCallback(() => {
        /**
         * Useful for visually resetting uncontrolled components. If this is passed
         * as a prop, it will force a new mount on clearing the filters.
         */
        setControlKey(generateRandomId(6));
        clearFilters?.();
    }, [clearFilters]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                    SUPPORT QUERIES                                      $//
    //~-----------------------------------------------------------------------------------------~//

    const {
        data: tagLists,
        isLoading: isTagsLoading,
        error: tagsError
    } = chqc.tag.useTags(locale);

    const { data: ingredients } = chqc.ingredient.useIngredients(locale);

    //~-----------------------------------------------------------------------------------------~//
    //$                               SELECTED FILTER DISPLAY DATA                              $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * All tags flattened from the tag lists so we can resolve names for selected tag ids.
     * Ingredients are already fetched above.
     */
    const allTags = useMemo(
        () => tagLists?.flatMap((list) => list.tags) ?? [],
        [tagLists]
    );

    const selectedTags = useMemo(
        () => allTags.filter((tag) => filters.tags?.includes(tag.id) ?? false),
        [allTags, filters.tags]
    );

    const selectedContainsIngredients = useMemo(
        () =>
            (ingredients ?? []).filter(
                (ing) => filters.containsIngredients?.includes(ing.id) ?? false
            ),
        [ingredients, filters.containsIngredients]
    );

    const selectedExcludesIngredients = useMemo(
        () =>
            (ingredients ?? []).filter(
                (ing) => filters.excludesIngredients?.includes(ing.id) ?? false
            ),
        [ingredients, filters.excludesIngredients]
    );

    const ingredientOptions = useMemo(
        () =>
            (ingredients ?? []).map((ing: IngredientDTO) => ({
                value: String(ing.id),
                label: ing.name
            })),
        [ingredients]
    );

    const hasActiveFilters = useMemo(
        () =>
            (filters.tags?.length ?? 0) > 0 ||
            (filters.containsIngredients?.length ?? 0) > 0 ||
            (filters.excludesIngredients?.length ?? 0) > 0 ||
            filters.timeMin !== undefined ||
            filters.timeMax !== undefined ||
            filters.hasImage === true,
        [
            filters.containsIngredients?.length,
            filters.excludesIngredients?.length,
            filters.hasImage,
            filters.tags?.length,
            filters.timeMax,
            filters.timeMin
        ]
    );

    //~-----------------------------------------------------------------------------------------~//
    //$                                       TAG FILTERS                                       $//
    //~-----------------------------------------------------------------------------------------~//

    const handleSelectTags = useCallback(
        (tags: RecipeTagDTO[]) => {
            updateFilter(
                'tags',
                tags.map((tag) => tag.id)
            );
        },
        [updateFilter]
    );

    const getTagModalContent = useCallback(
        () => (close: () => void) => (
            <FilterTagSelectionModal
                close={close}
                error={tagsError}
                initialTags={selectedTags}
                isLoading={isTagsLoading}
                onApply={handleSelectTags}
                onCancel={close}
                tagLists={tagLists}
            />
        ),
        [tagsError, selectedTags, isTagsLoading, handleSelectTags, tagLists]
    );

    const openTagModal = useCallback(() => {
        openModal(getTagModalContent(), { hideCloseButton: true });
    }, [openModal, getTagModalContent]);

    const removeTag = useCallback(
        (tagId: number) => () => {
            const next = (filters.tags ?? []).filter((id) => id !== tagId);
            updateFilter('tags', next.length > 0 ? next : undefined);
        },
        [filters.tags, updateFilter]
    );

    //~-----------------------------------------------------------------------------------------~//
    //$                                   INGREDIENT FILTERS                                    $//
    //~-----------------------------------------------------------------------------------------~//

    const handleContainsIngredientSelect = useCallback(
        (option: { value: string; label: string }) => {
            const id = Number(option.value);
            const prev = filters.containsIngredients ?? [];

            if (filters.excludesIngredients?.includes(id)) {
                alert({
                    message: t('app.recipe.filter.contains-error'),
                    variant: 'error'
                });
                return;
            }

            if (prev.includes(id)) {
                return;
            }

            updateFilter('containsIngredients', [...prev, id]);
        },
        [
            alert,
            filters.containsIngredients,
            filters.excludesIngredients,
            updateFilter,
            t
        ]
    );

    const handleExcludesIngredientSelect = useCallback(
        (option: { value: string; label: string }) => {
            const id = Number(option.value);
            const prev = filters.excludesIngredients ?? [];

            if (filters.containsIngredients?.includes(id)) {
                alert({
                    message: t('app.recipe.filter.excludes-error'),
                    variant: 'error'
                });
                return;
            }

            if (prev.includes(id)) {
                return;
            }

            updateFilter('excludesIngredients', [...prev, id]);
        },
        [
            alert,
            filters.containsIngredients,
            filters.excludesIngredients,
            updateFilter,
            t
        ]
    );

    const removeContainsIngredient = useCallback(
        (id: number) => () => {
            const next = (filters.containsIngredients ?? []).filter(
                (i) => i !== id
            );
            updateFilter(
                'containsIngredients',
                next.length > 0 ? next : undefined
            );
        },
        [filters.containsIngredients, updateFilter]
    );

    const removeExcludesIngredient = useCallback(
        (id: number) => () => {
            const next = (filters.excludesIngredients ?? []).filter(
                (i) => i !== id
            );
            updateFilter(
                'excludesIngredients',
                next.length > 0 ? next : undefined
            );
        },
        [filters.excludesIngredients, updateFilter]
    );

    //~-----------------------------------------------------------------------------------------~//
    //$                                     TIME RANGE FILTER                                   $//
    //~-----------------------------------------------------------------------------------------~//

    const handleTimeChange = useCallback(
        (min: number, max: number) => {
            const effectiveMin = min > 0 ? min : undefined;
            const effectiveMax = max < MAX_TIME_MINUTES ? max : undefined;

            updateFilter('timeMin', effectiveMin);
            updateFilter('timeMax', effectiveMax);
        },
        [updateFilter]
    );

    const handleImageFilterChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) =>
            updateFilter('hasImage', e.target.checked ? true : undefined),
        [updateFilter]
    );

    return (
        <div className={className}>
            <div className="flex items-center justify-between h-8">
                <Typography variant="heading-sm">
                    {t('app.recipe.filter.title')}
                </Typography>

                {hasActiveFilters ? (
                    <ButtonBase
                        size="sm"
                        color="danger"
                        outlined
                        onClick={handleClear}
                    >
                        {t('app.general.clear-all')}
                    </ButtonBase>
                ) : null}
            </div>

            <div className="flex flex-col gap-2">
                <Typography variant="body-sm" className="font-semibold">
                    {t('app.recipe.filter.contains-ingredients')}
                </Typography>

                <IngredientFilterInput
                    id="contains-ingredients"
                    name="contains-ingredients"
                    options={ingredientOptions}
                    placeholder={t('app.recipe.filter.ingredient-placeholder')}
                    selectedIngredients={selectedContainsIngredients}
                    chipColor="secondary"
                    onSelect={handleContainsIngredientSelect}
                    onRemove={removeContainsIngredient}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Typography variant="body-sm" className="font-semibold">
                    {t('app.recipe.filter.excludes-ingredients')}
                </Typography>

                <IngredientFilterInput
                    id="excludes-ingredients"
                    name="excludes-ingredients"
                    options={ingredientOptions}
                    placeholder={t('app.recipe.filter.ingredient-placeholder')}
                    selectedIngredients={selectedExcludesIngredients}
                    chipColor="danger"
                    onSelect={handleExcludesIngredientSelect}
                    onRemove={removeExcludesIngredient}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Typography variant="body-sm" className="font-semibold">
                    {t('app.recipe.tags')}
                </Typography>

                <ButtonBase
                    size="sm"
                    color="subtle"
                    outlined
                    className="w-full"
                    onClick={openTagModal}
                >
                    {t('app.recipe.select-tags')}
                </ButtonBase>

                {selectedTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedTags.map((tag) => (
                            <ChipButton
                                key={tag.id}
                                size="sm"
                                color="primary"
                                icon="close"
                                onClick={removeTag(tag.id)}
                            >
                                {tag.name}
                            </ChipButton>
                        ))}
                    </div>
                ) : null}
            </div>

            <div className="flex flex-col gap-2">
                <RangeSlider
                    id="time-range"
                    name="time-range"
                    key={controlKey}
                    label={t('app.recipe.filter.time-range')}
                    min={0}
                    max={MAX_TIME_MINUTES}
                    defaultMin={filters.timeMin ?? 0}
                    defaultMax={filters.timeMax ?? MAX_TIME_MINUTES}
                    step={5}
                    minLabel={t('app.recipe.filter.time-min')}
                    maxLabel={t('app.recipe.filter.time-max')}
                    onChange={handleTimeChange}
                />
            </div>

            <FormCheckbox
                name="has-image"
                label={t('app.recipe.filter.has-image')}
                id="has-image"
                key={controlKey}
                onChange={handleImageFilterChange}
                className="h-4 w-4 cursor-pointer accent-blue-600"
            />
        </div>
    );
};
