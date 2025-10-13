'use client';

import React, { useCallback, useState } from 'react';
import type { RecipeTagDTO, TagListDTO } from '@/common/types';
import type { ModalProps } from '@/client/components/organisms/Modal/types';
import {
    ButtonBase,
    Loader,
    TagSelectionList,
    TagSelectionBox
} from '@/client/components';
import { useCreateRecipeStore, useLocale, useSnackbar } from '@/client/store';
import type { RequestError } from '@/client/error';
import { MAX_TAGS, RECIPE_TAG_CATEGORY_LIMITS_BY_ID } from '@/common/constants';
import { chqc } from '@/client/request/queryClient';

type TagSelectionModalProps = Readonly<{
    error?: RequestError | null;
    initialTags?: RecipeTagDTO[];
    isLoading?: boolean;
    onApply?: (tags: RecipeTagDTO[]) => void;
    onCancel?: () => void;
    tagLists?: TagListDTO[];
}> &
    ModalProps;

export const TagSelectionModal: React.FC<TagSelectionModalProps> = ({
    close,
    error,
    initialTags = [],
    isLoading,
    onApply,
    onCancel,
    tagLists
}) => {
    const { t } = useLocale();
    const { alert } = useSnackbar();

    const {
        recipeObject,
        incrementSuggestions,
        getRemainingsuggestions,
        canSuggest
    } = useCreateRecipeStore();

    const { mutate: suggestTags, isPending: isSuggesting } =
        chqc.tag.useSuggestions({
            onSuccess: (tags) => {
                setSelectedTags(
                    tags.sort((a, b) => a.categoryId - b.categoryId)
                );

                incrementSuggestions();

                alert({
                    message: t('app.recipe.suggest-limit-countdown', {
                        remaining: getRemainingsuggestions()
                    }),
                    variant: 'info'
                });
            }
        });

    const [selectedTags, setSelectedTags] =
        useState<RecipeTagDTO[]>(initialTags);

    const toggleTag = useCallback(
        (tag: RecipeTagDTO) => {
            setSelectedTags((prev) => {
                const alreadySelected = prev.some((t) => t.id === tag.id);

                // If tag already selected just deselect it
                if (alreadySelected) {
                    return prev.filter((t) => t.id !== tag.id);
                }

                if (selectedTags.length >= MAX_TAGS) {
                    return prev;
                }

                const categoryLimit =
                    RECIPE_TAG_CATEGORY_LIMITS_BY_ID[
                        tag.categoryId as keyof typeof RECIPE_TAG_CATEGORY_LIMITS_BY_ID
                    ] ?? Infinity;

                const currentlySelectedInCategory = getSelectedCountForCategory(
                    prev,
                    tag.categoryId
                );

                // Simply prevent adding if category limit is reached
                if (currentlySelectedInCategory >= categoryLimit) {
                    return prev;
                }

                const sortedTags = [...prev, tag].sort(
                    (a, b) => a.categoryId - b.categoryId
                );

                return sortedTags;
            });
        },
        [selectedTags]
    );

    const handleSuggest = useCallback(() => {
        if (!recipeObject) return;

        if (!canSuggest()) {
            alert({
                message: t('app.recipe.suggest-limit-countdown', {
                    remaining: getRemainingsuggestions()
                }),
                variant: 'info'
            });
            return;
        }

        suggestTags(recipeObject);
    }, [
        recipeObject,
        suggestTags,
        alert,
        t,
        canSuggest,
        getRemainingsuggestions
    ]);

    const handleApply = useCallback(() => {
        onApply?.(selectedTags);
        close?.();
    }, [onApply, selectedTags, close]);

    const handleClose = useCallback(() => {
        onCancel?.();
        close?.();
    }, [onCancel, close]);

    if (isLoading || error) return <Loader />;

    return (
        <div className="flex flex-col w-full h-full max-h-[85dvh] md:max-h-[70dvh] max-w-[90dvw] md:max-w-[80dvw] xl:max-w-[70dvw]">
            <TagSelectionBox
                className="min-h-[70px]"
                tags={selectedTags}
                onSuggest={handleSuggest}
                isLoading={isSuggesting}
            />

            <TagSelectionList
                tagLists={tagLists ?? []}
                selectedTags={selectedTags}
                onSelect={toggleTag}
                className="overflow-y-auto"
            />

            <div className="flex-shrink-0 flex w-full gap-3 mt-4 pt-4">
                <ButtonBase
                    onClick={handleClose}
                    color="subtle"
                    outlined
                    size="md"
                    className="w-full"
                >
                    {t('app.general.cancel')}
                </ButtonBase>

                <ButtonBase
                    color="primary"
                    onClick={handleApply}
                    size="md"
                    className="w-full"
                >
                    {t('app.general.confirm')}
                </ButtonBase>
            </div>
        </div>
    );
};

function getSelectedCountForCategory(tags: RecipeTagDTO[], categoryId: number) {
    return tags.filter((t) => t.categoryId === categoryId).length;
}
