import * as React from 'react';
import { SkeletonBox, SkeletonTable } from '@/client/components';

export const AdminUsersSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <SkeletonBox className="w-56 h-8" />
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <SkeletonBox className="h-10 md:w-64 w-full" />
                <SkeletonBox className="h-10 md:w-36 w-full" />
                <SkeletonBox className="h-10 md:w-44 w-full" />
                <SkeletonBox className="h-10 md:w-36 w-full" />
            </div>

            <SkeletonTable rows={10} />
        </div>
    );
};
