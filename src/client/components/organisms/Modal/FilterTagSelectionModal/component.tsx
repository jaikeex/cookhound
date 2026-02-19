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
import { useLocale, useSnackbar } from '@/client/store';
import type { RequestError } from '@/client/error';

type FilterTagSelectionModalProps = Readonly<{
    error?: RequestError | null;
    initialTags?: RecipeTagDTO[];
    isLoading?: boolean;
    onApply?: (tags: RecipeTagDTO[]) => void;
    onCancel?: () => void;
    tagLists?: TagListDTO[];
}> &
    ModalProps;

export const FilterTagSelectionModal: React.FC<
    FilterTagSelectionModalProps
> = ({
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

    const [selectedTags, setSelectedTags] =
        useState<RecipeTagDTO[]>(initialTags);

    const toggleTag = useCallback((tag: RecipeTagDTO) => {
        setSelectedTags((prev) => {
            const alreadySelected = prev.some((t) => t.id === tag.id);

            if (alreadySelected) {
                return prev.filter((t) => t.id !== tag.id);
            }

            return [...prev, tag].sort((a, b) => a.categoryId - b.categoryId);
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

    if (isLoading) return <Loader />;

    if (error) {
        alert({
            message: t('app.error.default'),
            variant: 'error'
        });
    }

    return (
        <div className="flex flex-col w-full h-full max-h-[85dvh] md:max-h-[70dvh] max-w-[90dvw] md:max-w-[80dvw] xl:max-w-[70dvw]">
            <TagSelectionBox className="min-h-[70px]" tags={selectedTags} />

            <TagSelectionList
                tagLists={tagLists ?? []}
                selectedTags={selectedTags}
                onSelect={toggleTag}
                showCategoryLimits={false}
                className="overflow-y-auto"
            />

            <div className="shrink-0 flex w-full gap-3 mt-4 pt-4">
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
