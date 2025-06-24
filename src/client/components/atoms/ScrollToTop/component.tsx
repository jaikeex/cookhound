'use client';

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
    enabled?: boolean;
}>;

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ enabled = true }) => {
    const handlePathnameChange = useCallback(() => {
        if (!enabled) return;

        window.scrollTo(0, 0);
    }, [enabled]);

    usePathnameChangeListener({
        onChange: handlePathnameChange,
        ignoreParams: true
    });

    return null;
};
