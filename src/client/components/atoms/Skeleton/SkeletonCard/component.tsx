import React from 'react';
import { SkeletonBox } from '@/client/components/atoms/Skeleton/SkeletonBox';
import { SkeletonImage } from '@/client/components/atoms/Skeleton/SkeletonImage';

type SkeletonCardProps = Readonly<{
    className?: string;
}>;

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className }) => {
    return (
        <div
            className={`flex flex-col h-full overflow-hidden border border-gray-300 rounded-lg shadow-sm bg-slate-200 dark:bg-slate-800 dark:border-gray-700 ${className || ''}`}
        >
            {/* Skeleton Image */}
            <div className="flex items-center justify-center flex-shrink-0 object-cover w-full h-32 bg-gray-300 dark:bg-gray-700 animate-pulse">
                <SkeletonImage className="w-full aspect-video" />
            </div>

            {/* Content Section */}
            <div className="flex flex-col justify-between h-full p-2 space-y-2">
                {/* Title Skeleton */}
                <SkeletonBox className="w-3/4 h-5" />

                {/* Bottom Section with Time and Rating */}
                <div className="flex items-center justify-between gap-2 mt-auto">
                    {/* Time Skeleton */}
                    <SkeletonBox className="w-12 h-4" />

                    {/* Rating Skeleton - Responsive */}
                    <div className="flex-shrink-0 hidden space-x-1 md:flex">
                        <SkeletonBox className="w-4 h-4" />
                        <SkeletonBox className="w-4 h-4" />
                        <SkeletonBox className="w-4 h-4" />
                        <SkeletonBox className="w-4 h-4" />
                        <SkeletonBox className="w-4 h-4" />
                    </div>

                    {/* Condensed Rating Skeleton for mobile */}
                    <div className="flex items-center gap-1 md:hidden">
                        <SkeletonBox className="w-6 h-4" />
                        <SkeletonBox className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};
