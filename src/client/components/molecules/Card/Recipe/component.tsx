import * as React from 'react';
import { Icon, RecipeImage, Typography } from '@/client/components/atoms';
import { RecipeInfo } from '@/client/components/molecules/RecipeInfo';
import { Rating } from '@/client/components/molecules';
import Link from 'next/link';
import type { RecipeCardProps } from '@/client/components/molecules/Card/types';
import { classNames } from '@/client/utils';

export const RecipeCard: React.FC<RecipeCardProps> = ({
    displayId,
    title,
    imageUrl,
    rating,
    time,
    index = 0
}) => {
    return (
        <div
            className={classNames(
                'group focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-slate-200 dark:focus-within:ring-offset-slate-800',
                'flex flex-col h-full overflow-hidden border border-gray-300 rounded-lg shadow-sm',
                'bg-slate-200 dark:bg-slate-800 dark:border-gray-700 animate-fade-in-up'
            )}
            style={{ animationDelay: `${index * 1}ms` }}
        >
            <Link
                href={`/recipe/${displayId}`}
                className="flex flex-col h-full text-inherit"
                aria-label={title}
            >
                <RecipeImage
                    src={imageUrl}
                    alt={`${title} image`}
                    width={280}
                    height={160}
                    className="flex-shrink-0 object-cover w-full aspect-video"
                />
                <div className="flex flex-col justify-between h-full p-2 space-y-2">
                    <Typography
                        variant="heading-xs"
                        className="text-sm font-semibold line-clamp-2"
                    >
                        {title}
                    </Typography>
                    <div className="flex items-center justify-between gap-2 mt-auto">
                        <RecipeInfo time={time} size="sm" />

                        {rating ? (
                            <React.Fragment>
                                <Rating
                                    rating={rating}
                                    disabled
                                    size="sm"
                                    className="flex-shrink-0 hidden md:block"
                                />
                                <div className="flex items-center gap-1 md:hidden">
                                    <Typography variant="label">
                                        {rating}
                                    </Typography>
                                    <Icon
                                        name="starFull"
                                        size={16}
                                        className="text-yellow-500"
                                    />
                                </div>
                            </React.Fragment>
                        ) : null}
                    </div>
                </div>
            </Link>
        </div>
    );
};
