import { ProfileTab, type ProfileNavigationItem } from '@/client/types/core';

//~-----------------------------------------------------------------------------------------~//
//$                                   ONE FALLBACK POLICY                                   $//
//#
//# The requested tab and the tab set that is actually rendered can disagree, and there are
//# several ways for that to happen: the url names a tab that does not exist, the viewer is not
//# the owner so there is no dashboard tab, or auth resolves mid-session and takes the dashboard
//# tab away again. Every profile surface has to answer the same question, so it is answered
//# here once instead of three times with three different results.
//#
//# Recipes is the fallback because it is the only tab present for every viewer.
//~-----------------------------------------------------------------------------------------~//

export const PROFILE_FALLBACK_TAB = ProfileTab.Recipes;

/**
 * Resolves a requested tab to a position in the tab set being rendered.
 */
export const resolveProfileTabIndex = (
    items: ProfileNavigationItem[],
    tab: ProfileTab
): number => {
    const requested = items.findIndex((item) => item.param === tab);

    if (requested !== -1) {
        return requested;
    }

    const fallback = items.findIndex(
        (item) => item.param === PROFILE_FALLBACK_TAB
    );

    return Math.max(fallback, 0);
};
