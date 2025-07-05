import React from 'react';
import { Tag } from '@/client/components';
import type { RecipeTagDTO } from '@/common/types';
import { classNames } from '@/client/utils';

type TagListProps = Readonly<{
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    tags: RecipeTagDTO[];
}>;

export const TagList: React.FC<TagListProps> = ({
    tags,
    className,
    size = 'md'
}) => {
    return (
        <div className={classNames('flex flex-wrap gap-2', className)}>
            {tags.map((tag) => (
                <Tag
                    key={tag.id}
                    name={tag.name}
                    categoryId={tag.categoryId}
                    size={size}
                />
            ))}
        </div>
    );
};
