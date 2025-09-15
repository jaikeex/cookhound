import * as React from 'react';
import Image from 'next/image';
import { classNames, generateImgPlaceholder } from '@/client/utils';

type RecipeImageProps = Readonly<{
    alt: string | null;
    className?: string;
    src: string | null;
    width?: number;
    height?: number;
}>;

export const RecipeImage: React.FC<RecipeImageProps> = ({
    alt,
    className,
    src,
    width = 320,
    height = 192
}) => {
    return (
        <Image
            src={src || '/img/recipe-placeholder.webp'}
            alt={alt || 'recipe image'}
            className={classNames(
                'object-cover w-full rounded-t-md aspect-video',
                className
            )}
            width={width}
            height={height}
            placeholder={'blur'}
            blurDataURL={generateImgPlaceholder(80, 80, 80)}
        />
    );
};
