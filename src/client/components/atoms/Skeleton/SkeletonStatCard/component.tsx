import React from 'react';
import { SkeletonBox } from '@/client/components';

export const SkeletonStatCard: React.FC = () => (
    <div className="rounded-lg border border-gray-200 bg-sheet p-4 shadow-sm dark:border-gray-700">
        <SkeletonBox className="h-4 w-24" />
        <SkeletonBox className="mt-2 h-7 w-16" />
        <SkeletonBox className="mt-2 h-3 w-32" />
    </div>
);
