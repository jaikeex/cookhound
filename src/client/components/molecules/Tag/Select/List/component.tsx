'use client';

import { TagSelect, Typography } from '@/client/components';
import { classNames } from '@/client/utils';
import type { RecipeTagDTO, TagListDTO } from '@/common/types';
import React, { useCallback } from 'react';
import {
    CATEGORY_TRANSLATIONS,
    RECIPE_TAG_CATEGORY_LIMITS_BY_ID,
    RECIPE_TAG_CATEGORY_LIMITS_BY_NAME
} from '@/common/constants';
import { useLocale } from '@/client/store';

type TagSelectionListProps = Readonly<{
    className?: string;
    tagLists: TagListDTO[];
    selectedTags: RecipeTagDTO[];
    onSelect: (tag: RecipeTagDTO) => void;
    showCategoryLimits?: boolean;
}>;

export const TagSelectionList: React.FC<TagSelectionListProps> = ({
    className,
    tagLists,
    selectedTags,
    onSelect,
    showCategoryLimits = true
}) => {
    const { t } = useLocale();

    const handleToggle = useCallback(
        (tag: RecipeTagDTO) => () => onSelect?.(tag),
        [onSelect]
    );

    const getCheckedStatus = useCallback(
        (tag: RecipeTagDTO) => selectedTags.some((t) => t.id === tag.id),
        [selectedTags]
    );

    const isCategoryLimitReached = useCallback(
        (categoryId: number) => {
            if (!showCategoryLimits) return false;

            const categoryLimit =
                RECIPE_TAG_CATEGORY_LIMITS_BY_ID[
                    categoryId as keyof typeof RECIPE_TAG_CATEGORY_LIMITS_BY_ID
                ] ?? Infinity;

            const selectedCount = selectedTags.filter(
                (t) => t.categoryId === categoryId
            ).length;

            return selectedCount >= categoryLimit;
        },
        [selectedTags, showCategoryLimits]
    );

    return (
        <div className={classNames('flex-1 mt-6 px-2', className)}>
            <div className="flex flex-col gap-4">
                {tagLists?.map((list) => (
                    <div key={list.category} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Typography variant="heading-xs" className="mb-2">
                                {t(CATEGORY_TRANSLATIONS[list.category])}
                            </Typography>

                            {showCategoryLimits ? (
                                <Typography
                                    variant="body-sm"
                                    className="mb-2 text-gray-600 dark:text-gray-400"
                                >
                                    ({t('app.general.max')}:{' '}
                                    {
                                        RECIPE_TAG_CATEGORY_LIMITS_BY_NAME[
                                            list.category as keyof typeof RECIPE_TAG_CATEGORY_LIMITS_BY_NAME
                                        ]
                                    }
                                    )
                                </Typography>
                            ) : null}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 gap-x-8">
                            {list.tags.map((tag) => (
                                <TagSelect
                                    key={tag.id}
                                    name={tag.name}
                                    disabled={
                                        !getCheckedStatus(tag) &&
                                        isCategoryLimitReached(tag.categoryId)
                                    }
                                    isChecked={getCheckedStatus(tag)}
                                    onChange={handleToggle(tag)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
