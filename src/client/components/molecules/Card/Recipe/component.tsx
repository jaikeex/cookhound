import * as React from 'react';
import Image from 'next/image';
import { Icon, Typography } from '@/client/components/atoms';
import { RecipeInfo } from '@/client/components/molecules/RecipeInfo';
import { Rating } from '@/client/components/molecules';
import Link from 'next/link';

type RecipeCardProps = Readonly<{
    displayId: string;
    title: string;
    imageUrl: string;
    time: number;
    rating: number | null;
    portionSize: number | null;
    index?: number;
}>;

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
            className="flex flex-col h-full overflow-hidden border border-gray-300 rounded-lg shadow-sm bg-slate-200 dark:bg-slate-800 dark:border-gray-700 animate-fade-in-up"
            style={{ animationDelay: `${index * 1}ms` }}
        >
            <Link
                href={`/recipe/${displayId}`}
                className="flex flex-col h-full text-inherit"
            >
                <Image
                    src={imageUrl}
                    alt={title}
                    width={240}
                    height={160}
                    className="flex-shrink-0 object-cover w-full"
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
                        <Rating
                            rating={rating}
                            disabled
                            size="sm"
                            className="flex-shrink-0 hidden md:block"
                        />
                        <div className="flex items-center gap-1 md:hidden">
                            <Typography variant="label">{rating}</Typography>
                            <Icon
                                name="starFull"
                                size={16}
                                className="text-yellow-500"
                            />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};
