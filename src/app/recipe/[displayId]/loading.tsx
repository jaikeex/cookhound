import React from 'react';

import {
    DesktopRecipeViewSkeleton,
    MobileRecipeViewSkeleton
} from '@/client/components';

export default function Loading() {
    return (
        <>
            <div className="hidden md:block">
                <DesktopRecipeViewSkeleton />
            </div>
            <div className="block md:hidden">
                <MobileRecipeViewSkeleton />
            </div>
        </>
    );
}
