'use client';

import React, { useCallback, useState } from 'react';
import type { RecipeTagDTO, TagListDTO } from '@/common/types';
import type { ModalProps } from '@/client/components/molecules/Modal/types';
import { ButtonBase, Loader, TagSelectionList } from '@/client/components';
import { useLocale } from '@/client/store';
import { TagSelectionBox } from '@/client/components';
import type { RequestError } from '@/client/error';
import { RECIPE_TAG_CATEGORY_LIMITS_BY_ID } from '@/common/constants';

type TagSelectionModalProps = Readonly<{
    initialTags?: RecipeTagDTO[];
    onCancel?: () => void;
    onApply?: (tags: RecipeTagDTO[]) => void;
    tagLists?: TagListDTO[];
    isLoading?: boolean;
    error?: RequestError | null;
}> &
    ModalProps;

export const TagSelectionModal: React.FC<TagSelectionModalProps> = ({
    initialTags = [],
    onCancel,
    close,
    onApply,
    tagLists,
    isLoading,
    error
}) => {
    const { t } = useLocale();

    const [selectedTags, setSelectedTags] =
        useState<RecipeTagDTO[]>(initialTags);

    const toggleTag = useCallback((tag: RecipeTagDTO) => {
        setSelectedTags((prev) => {
            const alreadySelected = prev.some((t) => t.id === tag.id);

            // If tag already selected just deselect it
            if (alreadySelected) {
                return prev.filter((t) => t.id !== tag.id);
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
    }, []);

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
        <div className="flex flex-col w-full h-full max-h-[85dvh] md:max-h-[70dvh] max-w-[90dvh] md:max-w-[80dvh] xl:max-w-[70dvh]">
            <TagSelectionBox className="min-h-[66px]" tags={selectedTags} />

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
