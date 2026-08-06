import React from 'react';

import {
    DesktopRecipeViewSkeleton,
    MobileRecipeViewSkeleton
} from '@/client/components';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                   SKELETON SHAPE SELECTION                                  ?//
///
//# The wrapper mirrors RecipeViewLayout container exactly - same @container, same max-width,
//# same lack of padding - so the two skeletons swap on the same measurement the real view uses.
//# A viewport breakpoint cannot stand in for it: md is 768px, but the container reaches the
//# 45rem threshold at a 736px viewport, so md: would hand the 736-767px band a mobile
//# skeleton and then hydrate into the desktop layout - the exact shift a skeleton exists to
//# prevent.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

export default function Loading() {
    return (
        <div className="@container mx-auto max-w-3xl 3xl:max-w-5xl">
            <div className="hidden @recipe:block">
                <DesktopRecipeViewSkeleton />
            </div>
            <div className="block @recipe:hidden">
                <MobileRecipeViewSkeleton />
            </div>
        </div>
    );
}
