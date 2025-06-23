'use client';

import { MAIN_PAGE_ID } from '@/client/constants';
import { usePathnameChangeListener } from '@/client/hooks';
import { useCallback } from 'react';

//?—————————————————————————————————————————————————————————————————————————————————————————?//
//?                                         WOHACK                                          ?//
///
//# This is purely a wohack component to make sure the page is scrolled to the top after
//# navigation. The default nextjs implementation uses window.scrolltop = 0; which does not
//# work when the page uses a wrapper div with height = 100vh and overflow auto.
///
//?—————————————————————————————————————————————————————————————————————————————————————————?//

type ScrollToTopProps = Readonly<{
    containerId?: string;
    enabled?: boolean;
}>;

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
    containerId = MAIN_PAGE_ID,
    enabled = true
}) => {
    const handlePathnameChange = useCallback(() => {
        if (!enabled) return;

        const container = document.getElementById(containerId);
        if (container) {
            container.scrollTo(0, 0);
        }
    }, [containerId, enabled]);

    usePathnameChangeListener({
        onChange: handlePathnameChange
    });

    return null;
};
