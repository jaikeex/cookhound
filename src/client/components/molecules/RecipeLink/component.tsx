import React, { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { RecipeForDisplayDTO } from '@/common/types';
import { generateImgPlaceholder, classNames } from '@/client/utils';
import { Typography } from '@/client/components';

export type RecipeLinkProps = Readonly<{
    className?: string;
    onClick?: () => void;
    onFocus?: () => void;
    recipe: RecipeForDisplayDTO;
}>;

export const RecipeLink = forwardRef<HTMLAnchorElement, RecipeLinkProps>(
    ({ recipe, onClick, onFocus, className }, ref) => (
        <Link
            ref={ref}
            href={`/recipe/${recipe.displayId}`}
            onClick={onClick}
            onFocus={onFocus}
            className={classNames(
                'flex items-center gap-2 text-inherit text-start',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-sm',
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
    )
);
