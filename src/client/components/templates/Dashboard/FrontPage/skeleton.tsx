import * as React from 'react';
import { SkeletonCard, SkeletonBox } from '@/client/components';
import classNames from 'classnames';

export const FrontPageSkeleton: React.FC = () => {
    const cards = Array.from({ length: 12 }, (_, index) => (
        <SkeletonCard key={index} />
    ));

    return (
        <React.Fragment>
            {/* Banner Skeleton */}
            <div
                className={classNames(
                    'fixed top-0 left-0 z-10 w-full h-[160px] md:h-[206px]',
                    'bg-gradient-to-b from-green-100 to-green-200 dark:from-gray-800 dark:to-gray-900'
                )}
            >
                <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
                    <div className="flex flex-col gap-4 mt-12 mb-3 md:mt-16 md:mb-6">
                        <SkeletonBox className="w-64 h-5 max-w-md mx-auto" />
                    </div>

                    <div className="w-full max-w-md">
                        {/* Search Input Skeleton */}
                        <div className="relative">
                            <SkeletonBox className="w-full h-10 rounded-md" />
                            <SkeletonBox className="absolute w-24 h-8 transform -translate-y-1/2 rounded right-1 top-1/2" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Gradient Overlay Skeleton */}
            <div
                className={classNames(
                    'fixed left-0 w-[100dvw] h-6 top-[160px] md:top-[204px] z-10',
                    'bg-gradient-to-b from-[#f0fdf4] via-[#f0fdf4] via-80% to-transparent',
                    'dark:from-[#030712] dark:via-[#030712] dark:via-80% dark:to-transparent'
                )}
            />

            {/* Recipe Cards Grid */}
            <div
                className={classNames(
                    'max-w-screen-sm px-4 mx-auto mt-32 md:mt-36 md:max-w-screen-md xl:max-w-screen-lg',
                    'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4'
                )}
            >
                {cards}
            </div>
        </React.Fragment>
    );
};
