import React from 'react';
import { SkeletonBox, SkeletonImage, SkeletonList } from '@/client/components';

export type MobileRecipeViewSkeletonProps = Readonly<{
    className?: string;
}>;

export const MobileRecipeViewSkeleton: React.FC<
    MobileRecipeViewSkeletonProps
> = ({ className }) => {
    return (
        <div className={`max-w-screen-md mx-auto ${className}`}>
            <div className={'space-y-4'}>
                {/* Recipe image skeleton */}
                <SkeletonImage
                    className={'w-full aspect-video mx-auto max-w-[480px]'}
                />

                {/* Recipe title skeleton */}
                <SkeletonBox className={'h-8 w-64 mx-auto'} />

                {/* Recipe info and rating row */}
                <div className={'flex items-center gap-4'}>
                    <div className={'flex justify-between gap-1 w-full'}>
                        <div className={'flex gap-1'}>
                            <SkeletonBox className={'h-10 w-20'} />
                            <SkeletonBox className={'h-10 w-20'} />
                        </div>

                        <SkeletonBox className={'h-10 w-28'} />
                    </div>
                </div>

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
