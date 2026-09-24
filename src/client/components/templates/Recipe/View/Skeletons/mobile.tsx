import React from 'react';
import { SkeletonBox } from '@/client/components/atoms/Skeleton/SkeletonBox';
import { SkeletonImage } from '@/client/components/atoms/Skeleton/SkeletonImage';
import { SkeletonList } from '@/client/components/atoms/Skeleton/SkeletonList';

export type MobileRecipeViewSkeletonProps = Readonly<{
    className?: string;
}>;

export const MobileRecipeViewSkeleton: React.FC<
    MobileRecipeViewSkeletonProps
> = ({ className }) => {
    return (
        <div className={`max-w-3xl mx-auto ${className}`}>
            <div className={'space-y-4'}>
                {/* Recipe image skeleton */}
                <SkeletonImage
                    className={'w-full aspect-video mx-auto max-w-120'}
                />

                {/* Recipe title skeleton */}
                <SkeletonBox className={'h-8 w-64 mx-auto'} />

                {/* Rating  under the title */}
                <div className={'flex flex-col items-center gap-1 -mt-2'}>
                    <SkeletonBox className={'h-6 w-36'} />
                    <SkeletonBox className={'h-4 w-28'} />
                </div>

                {/* Recipe info strip */}
                <SkeletonBox className={'h-12 w-full rounded-lg'} />

                {/* Divider */}
                <div
                    className={'border-t border-gray-200 dark:border-gray-700'}
                />

                <div className={'space-y-4'}>
                    {/* Tab headers skeleton */}
                    <SkeletonBox className={'h-8 w-full mb-2'} />

                    {/* Tab content skeleton */}
                    <SkeletonList
                        className={'pt-4'}
                        itemCount={7}
                        size={'sm'}
                    />
                </div>
            </div>
        </div>
    );
};
