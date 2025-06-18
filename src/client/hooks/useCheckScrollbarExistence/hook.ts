import { useLayoutEffect, useMemo, useState } from 'react';

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
        return ref?.current ?? document.getElementById('main-content');
    }, [ref]);

    const mainPage = useMemo(() => {
        return ref?.current ?? document.getElementById('main-page');
    }, [ref]);

    const topNavbar = useMemo(() => {
        return ref?.current ?? document.getElementById('top-navbar');
    }, [ref]);

    const bottomNavbar = useMemo(() => {
        return ref?.current ?? document.getElementById('bottom-navbar');
    }, [ref]);

    const topNavbarHeight = topNavbar?.clientHeight ?? 0;
    const bottomNavbarHeight = bottomNavbar?.clientHeight ?? 0;

    const contentHeight = contentWrapper?.scrollHeight ?? 0;
    const pageHeight = mainPage?.clientHeight
        ? mainPage.clientHeight - topNavbarHeight - bottomNavbarHeight
        : 0;

    useLayoutEffect(() => {
        // Measure scrollbar width on mount
        const measuredScrollbarWidth = getScrollbarWidth();
        setScrollbarWidth(measuredScrollbarWidth);

        if (!contentWrapper || !mainPage) {
            setIsScrollExist(false);
            return;
        }

        const updateScrollState = () => {
            contentWrapper && setIsScrollExist(contentHeight > pageHeight);
        };

        updateScrollState();

        const observer = new MutationObserver(() => {
            updateScrollState();
        });

        contentWrapper &&
            observer.observe(contentWrapper, {
                attributes: true,
                childList: true,
                subtree: true
            });

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
