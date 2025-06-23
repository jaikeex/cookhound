import * as React from 'react';
import { SkeletonCard } from '@/client/components';

export const FrontPageSkeleton: React.FC = () => {
    const cards = Array.from({ length: 12 }, (_, index) => (
        <SkeletonCard key={index} />
    ));

    return (
        <div className="grid max-w-screen-sm grid-cols-2 gap-4 px-4 mx-auto md:max-w-screen-md 3xl:max-w-screen-lg md:grid-cols-3">
            {cards}
        </div>
    );
};
