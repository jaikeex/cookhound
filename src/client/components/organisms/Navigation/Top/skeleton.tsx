import React from 'react';
import { classNames } from '@/client/utils';

export const TopNavigationSkeleton: React.FC = () => {
    return (
        <div
            aria-hidden
            className={classNames(
                'fixed top-0 left-0 right-0 z-20 flex items-center justify-between w-full p-4 h-14',
                'bg-[#d1fae5] dark:bg-[#030712]'
            )}
        >
            {/* Logo placeholder */}
            <div className="h-6 w-24 rounded-md bg-gray-300/60 dark:bg-gray-700/60 animate-pulse" />

            {/* Right-side controls placeholder */}
            <div className="flex items-center gap-3">
                <div className="hidden md:block h-8 w-24 rounded-md bg-gray-300/60 dark:bg-gray-700/60 animate-pulse" />
                <div className="hidden md:block h-8 w-8 rounded-md bg-gray-300/60 dark:bg-gray-700/60 animate-pulse" />
                <div className="h-9 w-9 rounded-full bg-gray-300/60 dark:bg-gray-700/60 animate-pulse" />
            </div>
        </div>
    );
};
