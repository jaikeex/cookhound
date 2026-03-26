import React from 'react';
import { SkeletonBox } from '@/client/components';

export const AdminApiDocsSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col gap-6">
            {/* Title */}
            <div>
                <SkeletonBox className="h-8 w-56" />
                <SkeletonBox className="mt-2 h-4 w-32" />
            </div>

            {/* Search */}
            <div className="flex flex-col gap-3">
                <SkeletonBox className="h-10 w-full md:max-w-sm" />
                <div className="flex gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonBox
                            key={i}
                            className="h-7 w-20 rounded-full"
                        />
                    ))}
                </div>
            </div>

            {/* Category groups */}
            {Array.from({ length: 3 }).map((_, g) => (
                <div key={g} className="flex flex-col gap-2">
                    <SkeletonBox className="h-6 w-32 mb-1" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonBox
                            key={i}
                            className="h-16 w-full rounded-lg"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};
