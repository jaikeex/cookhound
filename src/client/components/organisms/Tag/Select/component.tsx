'use client';

import { ButtonBase, TagList, TagSelectionModal } from '@/client/components';
import { chqc } from '@/client/request/queryClient';
import { useLocale, useModal } from '@/client/store';
import { classNames } from '@/client/utils';
import type { RecipeTagDTO } from '@/common/types';
import React, { useCallback, useState } from 'react';

type TagSelectionProps = Readonly<{
    className?: string;
    onConfirm?: (tags: RecipeTagDTO[]) => void;
}>;

export const TagSelection: React.FC<TagSelectionProps> = ({
    className,
    onConfirm
}) => {
    const { locale, t } = useLocale();
    const { openModal } = useModal();

    const [selectedTags, setSelectedTags] = useState<RecipeTagDTO[]>([]);

    const { data: tagLists, isLoading, error } = chqc.tag.useTags(locale);

    const handleConfirm = useCallback(
        (tags: RecipeTagDTO[]) => {
            const sortedTags = tags.sort((a, b) => a.categoryId - b.categoryId);

            setSelectedTags(sortedTags);
            onConfirm?.(sortedTags);
        },
        [onConfirm]
    );

    const getModalContent = useCallback(
        () => (close: () => void) => {
            return (
                <TagSelectionModal
                    initialTags={selectedTags}
                    close={close}
                    onCancel={close}
                    onApply={handleConfirm}
                    tagLists={tagLists}
                    isLoading={isLoading}
                    error={error}
                />
            );
        },
        [error, handleConfirm, isLoading, tagLists, selectedTags]
    );

    const openTagSelectionModal = useCallback(() => {
        const modalOptions = {
            hideCloseButton: true
        };

        openModal(getModalContent(), modalOptions);
    }, [openModal, getModalContent]);

    return (
        <div
            className={classNames(
                'w-full flex items-center flex-col gap-4',
                className
            )}
        >
            {/* Hidden input so the selected tag ids can be fetched from the form data. */}
            <input
                type="hidden"
                name="tags"
                value={JSON.stringify(selectedTags.map((tag) => tag.id))}
                readOnly
            />

            <TagList tags={selectedTags} size="sm" className="justify-center" />

            <ButtonBase onClick={openTagSelectionModal} color="subtle" outlined>
                {t('app.recipe.select-tags')}
            </ButtonBase>
        </div>
    );
};
