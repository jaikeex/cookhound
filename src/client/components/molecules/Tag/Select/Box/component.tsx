'use client';

import React from 'react';
import type { RecipeTagDTO } from '@/common/types';
import { Typography } from '@/client/components/atoms/Typography';
import { TagList } from '@/client/components/molecules/Tag/Display/List';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { Loader } from '@/client/components/atoms/Loader';
import { classNames } from '@/client/utils';
import { useScreenSize } from '@/client/hooks';
import { MAX_TAGS } from '@/common/constants';
import { t } from '@/client/locales';

type TagSelectionBoxProps = Readonly<{
    className?: string;
    tags: RecipeTagDTO[];
    onSuggest?: () => void;
    isLoading?: boolean;
}>;

export const TagSelectionBox: React.FC<TagSelectionBoxProps> = ({
    className,
    tags,
    onSuggest,
    isLoading
}) => {
    const { isMobile } = useScreenSize();

    return (
        <div
            className={classNames(
                'shrink-0 flex gap-2 bg-white dark:bg-slate-800 p-2',
                'border rounded-md border-gray-200 dark:border-gray-600',
                className
            )}
        >
            <div className="flex flex-col gap-2">
                <Typography variant="label">
                    {t('app.recipe.tags.selected')} ({tags.length}/{MAX_TAGS})
                </Typography>

                {tags.length > 0 ? (
                    <TagList tags={tags} size={isMobile ? 'xs' : 'sm'} />
                ) : (
                    <Typography
                        variant="body-sm"
                        className="italic text-gray-500"
                    >
                        {t('app.recipe.tags.no-tags-selected')}
                    </Typography>
                )}
            </div>

            {typeof onSuggest === 'function' ? (
                <ButtonBase
                    onClick={onSuggest}
                    color="secondary"
                    outlined
                    size="md"
                    className="w-24 ml-auto shrink-0"
                >
                    {isLoading ? (
                        <Loader size="sm" />
                    ) : (
                        t('app.general.suggest')
                    )}
                </ButtonBase>
            ) : null}
        </div>
    );
};
