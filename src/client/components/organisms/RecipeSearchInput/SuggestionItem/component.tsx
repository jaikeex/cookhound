import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Typography } from '@/client/components';
import { generateImgPlaceholder } from '@/client/utils';
import type { RecipeForDisplayDTO } from '@/common/types';

export type SuggestionItemProps = Readonly<{
    suggestion: RecipeForDisplayDTO;
    onSuggestionClick?: () => void;
}>;

export const SuggestionItem: React.FC<SuggestionItemProps> = ({
    suggestion,
    onSuggestionClick
}) => (
    <Link
        href={`/recipe/${suggestion.displayId}`}
        onClick={onSuggestionClick}
        className="flex items-center gap-2 px-4 py-1 text-inherit text-start"
    >
        <Image
            src={suggestion.imageUrl || '/img/recipe-placeholder.webp'}
            alt={suggestion.title}
            width={24}
            height={24}
            className="h-3"
            placeholder="blur"
            blurDataURL={generateImgPlaceholder(80, 80, 80)}
        />
        <Typography variant="body-sm" className="text-ellipsis">
            {suggestion.title}
        </Typography>
    </Link>
);
