'use client';

import { useLayoutEffect, useMemo, useState } from 'react';
import {
    MAIN_PAGE_ID,
    CONTENT_WRAPPER_ID,
    TOP_NAVBAR_ID,
    BOTTOM_NAVBAR_ID
} from '@/client/constants';

/**
 * I shamelessly copied this from stack overflow.
 */
function getScrollbarWidth(): number {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    (outer.style as any).msOverflowStyle = 'scrollbar';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

    outer.parentNode?.removeChild(outer);

    return scrollbarWidth;
}

export function useCheckScrollExistence(ref?: React.RefObject<HTMLElement>) {
    const [isScrollExist, setIsScrollExist] = useState(false);
    const [scrollbarWidth, setScrollbarWidth] = useState<number>(0);

    const contentWrapper = useMemo(() => {
        return ref?.current ?? document.getElementById(CONTENT_WRAPPER_ID);
    }, [ref]);

    const mainPage = useMemo(() => {
        return ref?.current ?? document.getElementById(MAIN_PAGE_ID);
    }, [ref]);

    const topNavbar = useMemo(() => {
        return ref?.current ?? document.getElementById(TOP_NAVBAR_ID);
    }, [ref]);

    const bottomNavbar = useMemo(() => {
        return ref?.current ?? document.getElementById(BOTTOM_NAVBAR_ID);
    }, [ref]);

    const topNavbarHeight = topNavbar?.clientHeight ?? 0;
    const bottomNavbarHeight = bottomNavbar?.clientHeight ?? 0;

    const contentHeight = contentWrapper?.scrollHeight ?? 0;
    const pageHeight = mainPage?.clientHeight
        ? mainPage.clientHeight - topNavbarHeight - bottomNavbarHeight
        : 0;

    useLayoutEffect(() => {
        const measuredScrollbarWidth = getScrollbarWidth();
        setScrollbarWidth(measuredScrollbarWidth);

        if (!contentWrapper || !mainPage) {
            setIsScrollExist(false);
            return;
        }

        const updateScrollState = () => {
            if (contentWrapper) {
                setIsScrollExist(contentHeight > pageHeight);
            }
        };

        updateScrollState();

        const observer = new MutationObserver(() => {
            updateScrollState();
        });

        if (contentWrapper) {
            observer.observe(contentWrapper, {
                attributes: true,
                childList: true,
                subtree: true
            });
        }

        return () => {
            observer.disconnect();
        };
    }, [ref, contentHeight, pageHeight, contentWrapper, mainPage]);

    return {
        doesScrollbarExist: isScrollExist,
        scrollbarWidth,
        topNavbarHeight,
        bottomNavbarHeight
    };
}
