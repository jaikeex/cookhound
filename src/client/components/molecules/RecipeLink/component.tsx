import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { RecipeForDisplayDTO } from '@/common/types';
import { generateImgPlaceholder, classNames } from '@/client/utils';
import { Typography } from '@/client/components';

export type RecipeLinkProps = Readonly<{
    className?: string;
    onClick?: () => void;
    recipe: RecipeForDisplayDTO;
}>;

export const RecipeLink: React.FC<RecipeLinkProps> = ({
    recipe,
    onClick,
    className
}) => (
    <Link
        href={`/recipe/${recipe.displayId}`}
        onClick={onClick}
        className={classNames(
            'flex items-center gap-2 text-inherit text-start',
            className
        )}
    >
        <Image
            src={recipe.imageUrl || '/img/recipe-placeholder.webp'}
            alt={recipe.title}
            width={24}
            height={24}
            className="h-3"
            placeholder="blur"
            blurDataURL={generateImgPlaceholder(80, 80, 80)}
        />
        <Typography
            variant="body-sm"
            className="whitespace-nowrap overflow-hidden text-ellipsis"
        >
            {recipe.title}
        </Typography>
    </Link>
);
