import * as React from 'react';
import { SkeletonCard } from '@/client/components';
import classNames from 'classnames';

export const FrontPageSkeleton: React.FC = () => {
    const cards = Array.from({ length: 12 }, (_, index) => (
        <SkeletonCard key={index} />
    ));

    return (
        <div
            className={classNames(
                'max-w-screen-sm px-4 mx-auto mt-32 md:mt-36 md:max-w-screen-md xl:max-w-screen-lg',
                'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4'
            )}
        >
            {cards}
        </div>
    );
};
