'use client';

import React from 'react';
import type { RecipeTagDTO } from '@/common/types';
import { Typography, TagList } from '@/client/components';
import { classNames } from '@/client/utils';
import { useScreenSize } from '@/client/hooks';
import { useLocale } from '@/client/store';

type TagSelectionBoxProps = Readonly<{
    className?: string;
    tags: RecipeTagDTO[];
}>;

const MAX_TAGS = 10;

export const TagSelectionBox: React.FC<TagSelectionBoxProps> = ({
    className,
    tags
}) => {
    const { t } = useLocale();
    const { isMobile } = useScreenSize();

    return (
        <div
            className={classNames(
                'flex-shrink-0 flex flex-col gap-2 bg-white dark:bg-slate-800 p-1',
                'border rounded-md border-gray-200 dark:border-gray-600',
                className
            )}
        >
            <Typography variant="label">
                {t('app.recipe.tags.selected')} ({tags.length}/{MAX_TAGS})
            </Typography>

            {tags.length > 0 ? (
                <TagList tags={tags} size={isMobile ? 'xs' : 'sm'} />
            ) : (
                <Typography variant="body-sm" className="italic text-gray-500">
                    {t('app.recipe.tags.no-tags-selected')}
                </Typography>
            )}
        </div>
    );
};
