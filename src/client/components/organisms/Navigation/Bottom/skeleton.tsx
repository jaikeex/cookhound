import React from 'react';
import { classNames } from '@/client/utils';

export const BottomNavigationSkeleton: React.FC = () => {
    return (
        <div
            aria-hidden
            className={classNames(
                `block md:hidden z-20 fixed bottom-0 left-0 right-0 h-14 px-2 py-4 bg-[#f0fdf4] dark:bg-[#021812]`,
                `flex *:w-full items-center justify-between border-t border-gray-300 dark:border-gray-800`
            )}
        >
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex justify-center">
                    <div className="h-6 w-6 rounded-md bg-gray-300/60 dark:bg-gray-700/60 animate-pulse" />
                </div>
            ))}
        </div>
    );
};
