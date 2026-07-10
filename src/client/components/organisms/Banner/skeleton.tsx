import React from 'react';
import { classNames } from '@/client/utils';

export const BannerSkeleton: React.FC = () => {
    return (
        <React.Fragment>
            <div
                aria-hidden
                id="banner"
                className={classNames(
                    'fixed top-0 left-0 w-full z-10 h-45 md:h-56.5',
                    'bg-linear-to-b from-green-100 to-green-200 dark:from-gray-800 dark:to-gray-900'
                )}
            >
                <div className="relative z-20 flex flex-col items-center justify-start h-full px-4 mt-6 text-center">
                    <div className="flex flex-col items-center gap-4 mt-12 mb-3 md:mt-16 md:mb-6">
                        {/* Banner copy placeholder */}
                        <div className="h-4 w-72 max-w-full rounded-md bg-gray-300/60 dark:bg-gray-700/60 animate-pulse" />
                    </div>

                    {/* Search input placeholder */}
                    <div className="w-full max-w-md mb-2 md:mb-4">
                        <div className="h-10 w-full rounded-md bg-gray-300/60 dark:bg-gray-700/60 animate-pulse" />
                    </div>

                    {/* Filters link placeholder */}
                    <div className="h-4 w-28 rounded-md bg-gray-300/60 dark:bg-gray-700/60 animate-pulse" />
                </div>
            </div>

            <div
                className={classNames(
                    'fixed left-0 w-dvw h-6 top-45 md:top-56 z-9',
                    'bg-linear-to-b from-[#f0fdf4] via-[#f0fdf4] via-80% to-transparent',
                    'dark:from-[#030712] dark:via-[#030712] dark:via-80% dark:to-transparent'
                )}
            />
        </React.Fragment>
    );
};
