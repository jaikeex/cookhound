import * as React from 'react';
import {
    SkeletonStatCard,
    SkeletonTable,
    SkeletonBox
} from '@/client/components';

export const AdminDashboardSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <SkeletonBox className="w-56 h-8" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
            </div>

            <SkeletonTable />
            <SkeletonTable />
        </div>
    );
};
