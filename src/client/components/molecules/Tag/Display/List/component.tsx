import React from 'react';
import { Tag } from '@/client/components/molecules/Tag/Display/Single';
import type { RecipeTagDTO } from '@/common/types';
import { resolveTagHub } from '@/common/constants';
import { classNames } from '@/client/utils';
import { t } from '@/client/locales';

type TagListProps = Readonly<{
    className?: string;
    linkToHubs?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    tags: RecipeTagDTO[];
}>;

export const TagList: React.FC<TagListProps> = ({
    tags,
    className,
    linkToHubs = false,
    size = 'md'
}) => {
    const wrapperClassName = classNames('flex flex-wrap gap-2', className);

    // A tag with no hub mapping (a db row outside HUB_SLUGS) falls back to an
    // inert chip rather than a dead link.
    const chips = tags.map((tag) => (
        <Tag
            key={tag.id}
            categoryId={tag.categoryId}
            href={linkToHubs ? resolveTagHub(tag)?.path : undefined}
            name={tag.name}
            size={size}
        />
    ));

    // Linked chips are navigation, so they get a landmark and a label instead
    // of being an unexplained run of links.
    if (linkToHubs) {
        return (
            <nav
                aria-label={t('app.recipe.tags.hub-nav')}
                className={wrapperClassName}
            >
                {chips}
            </nav>
        );
    }

    return <div className={wrapperClassName}>{chips}</div>;
};
