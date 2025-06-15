import React from 'react';
import {
    SkeletonBox,
    SkeletonImage,
    SkeletonList
} from '@/client/components/atoms/Skeleton';

export type DesktopRecipeViewSkeletonProps = Readonly<{
    className?: string;
}>;

export const DesktopRecipeViewSkeleton: React.FC<
    DesktopRecipeViewSkeletonProps
> = ({ className }) => {
    return (
        <div className={`max-w-screen-md px-4 mx-auto ${className}`}>
            <div className={'space-y-4'}>
                <div className={'flex justify-between gap-12'}>
                    <div
                        className={
                            'flex flex-col justify-between items-start w-full'
                        }
                    >
                        <div className={'flex flex-col w-full gap-2'}>
                            {/* Recipe title skeleton */}
                            <SkeletonBox className={'h-10 w-80'} />

                            {/* Rating skeleton */}
                            <SkeletonBox className={'h-8 w-40'} />
                        </div>

                        {/* Recipe info skeleton */}
                        <div className={'flex items-center gap-2'}>
                            <SkeletonBox className={'h-10 w-32'} />
                            <SkeletonBox className={'h-10 w-32'} />
                        </div>
                    </div>

                    {/* Recipe image skeleton */}
                    <SkeletonImage className={'w-full max-w-80 h-48'} />
                </div>

                {/* Divider */}
                <div
                    className={'border-t border-gray-200 dark:border-gray-700'}
                />

                <div className={'flex gap-12'}>
                    <div className={'space-y-2 w-[35%]'}>
                        {/* Ingredients title skeleton */}
                        <SkeletonBox className={'h-6 w-[60%]'} />

                        {/* Ingredients list skeleton */}
                        <div className={'flex justify-between gap-6'}>
                            <SkeletonList
                                className={'pt-2 w-[10%]'}
                                itemCount={6}
                                size={'sm'}
                            />
                            <SkeletonList
                                className={'pt-2 w-[80%]'}
                                itemCount={6}
                                size={'sm'}
                            />
                        </div>
                    </div>

                    <div className={'space-y-2 w-[65%]'}>
                        {/* Instructions title skeleton */}
                        <SkeletonBox className={'h-6 max-w-[40%]'} />

                        {/* Instructions skeleton */}
                        <SkeletonList
                            className={'pt-2 w-full'}
                            itemCount={5}
                            size={'xl'}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
