'use client';

import { useCallback, useState, useRef, useLayoutEffect } from 'react';
import {
    useOutsideClick,
    useParamsChangeListener,
    usePathnameChangeListener,
    useScreenSize
} from '@/client/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SidebarAnimations, SidebarConfig } from './types';
import classNames from 'classnames';

const DEFAULT_ANIMATIONS = {
    sidebar: {
        left: {
            position: 'fixed left-0 top-0 h-full',
            show: 'animate-slide-from-left',
            hide: 'animate-slide-to-left'
        },
        right: {
            position: 'fixed right-0 top-0 h-full',
            show: 'animate-slide-from-right',
            hide: 'animate-slide-to-right'
        },
        top: {
            position: 'fixed top-0 left-0 w-full',
            show: 'animate-slide-from-top',
            hide: 'animate-slide-to-top'
        },
        bottom: {
            position: 'fixed bottom-0 left-0 w-full',
            show: 'animate-slide-from-bottom',
            hide: 'animate-slide-to-bottom'
        }
    },
    backdrop: {
        show: 'animate-fade-in-slow',
        hide: 'animate-fade-out-slow'
    }
};

export const useSidebar = (config: SidebarConfig = {}) => {
    const {
        backdropAnimations = DEFAULT_ANIMATIONS.backdrop,
        closeOnPathnameChange = true,
        enableOutsideClick = true,
        paramKey = 'sidebar-open',
        position = 'right',
        sidebarAnimations = DEFAULT_ANIMATIONS.sidebar[position],
        useMobileParams = true
    } = config;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [backdropClass, setBackdropClass] = useState(backdropAnimations.show);
    const [containerClassName, setContainerClassName] = useState(
        getContainerClassName(sidebarAnimations, isSidebarOpen)
    );

    const isOpeningRef = useRef(false);

    //? There must be a better way to work arount this...
    //TODO: FIND A BETTER SOLUTION
    const lastPathnameRef: React.RefObject<string | null> = useRef(null);

    const { isMobile } = useScreenSize();
    const router = useRouter();
    const searchParams = useSearchParams();

    // ------------------------------------------------------------------------
    // ----------------------- IsSidebarOpen STATE HANDLERS -------------------
    // ------------------------------------------------------------------------

    const setIsSidebarOpenWithAnimation = useCallback(
        (open: boolean) => {
            // Timeout for the state change is needed to prevent flickering when closing the sidebar, since the animation
            // is not instant. The time is purposefully set to 10 ms less than the animation duration to ensure
            // the state change happens before the animation ends and starts the second time.
            const timeout = open ? 0 : isMobile ? 290 : 140;
            setContainerClassName(
                getContainerClassName(sidebarAnimations, open)
            );
            setBackdropClass(
                open ? backdropAnimations.show : backdropAnimations.hide
            );
            setTimeout(() => setIsSidebarOpen(open), timeout);
        },
        [isMobile, sidebarAnimations, backdropAnimations]
    );

    const closeSidebar = useCallback(
        () => setIsSidebarOpenWithAnimation(false),
        [setIsSidebarOpenWithAnimation]
    );

    const openSidebar = useCallback(
        () => setIsSidebarOpenWithAnimation(true),
        [setIsSidebarOpenWithAnimation]
    );

    const toggleSidebar = useCallback(() => {
        if (isSidebarOpen) closeSidebar();
        else {
            isOpeningRef.current = true;

            openSidebar();

            // On mobile screens, the sidebar is opened with a query parameter to facilitate the back/forward navigation
            if (useMobileParams && isMobile) {
                router.push(`?${paramKey}=true`);
            }

            setTimeout(() => {
                isOpeningRef.current = false;
            }, 100);
        }
    }, [
        closeSidebar,
        isSidebarOpen,
        isMobile,
        openSidebar,
        router,
        paramKey,
        useMobileParams
    ]);

    // ------------------------------------------------------------------------
    // -------------------- SEARCH PARAMS CHANGE LISTENER ---------------------
    // ------------------------------------------------------------------------

    const handleParamsChange = useCallback(() => {
        if (
            // This should fire ONLY when the user navigates through the routes with the sidebar open.
            // The pathname check ensures this, without it the handler would execute on every request,
            // which, for some reason, also includes the user role verification check from the middleware.
            //?I want the stuff the nextjs team is smoking...
            searchParams.get(paramKey) &&
            !isSidebarOpen &&
            lastPathnameRef.current !== window.location.pathname
        ) {
            // Remove the sidebar param from history
            // This prevents unwanted sidebar opening when navigating back from other pages.
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete(paramKey);

            const cleanUrl = currentUrl.pathname + (currentUrl.search || '');
            router.replace(cleanUrl);
        } else if (!searchParams.get(paramKey) && isSidebarOpen) {
            // This fires in two different cases:
            // (1) the user opens a link from inside the sidebar
            // (2) the user clicks the back/forward button with the sidebar open
            // In both cases, the sidebar is closed
            closeSidebar();
        }

        if (
            typeof window !== 'undefined' &&
            lastPathnameRef.current !== window.location.pathname
        ) {
            lastPathnameRef.current = window.location.pathname;
            return;
        }
    }, [closeSidebar, isSidebarOpen, router, searchParams, paramKey]);

    // Only set up params listener if mobile params are enabled
    useParamsChangeListener({
        key: paramKey,
        onChange: useMobileParams ? handleParamsChange : undefined
    });

    // ------------------------------------------------------------------------
    // ----------------------- PATHNAME CHANGE LISTENER -----------------------
    // ------------------------------------------------------------------------

    const handlePathnameChange = useCallback(() => {
        // Close the sidebar when the user navigates to a different page directly from the sidebar.
        // This mainly applies to desktop screens, where the query parameter is not used, and so the
        // params change listener does not fire.
        // On mobile screens this serves as redundancy.

        // Don't close if we're currently in the process of opening the sidebar
        if (isOpeningRef.current) return;

        if (!searchParams.get(paramKey)) closeSidebar();

        if (typeof window !== 'undefined') {
            lastPathnameRef.current = window.location.pathname;
        }
    }, [closeSidebar, searchParams, paramKey]);

    // Only set up pathname listener if enabled
    usePathnameChangeListener({
        onChange: closeOnPathnameChange ? handlePathnameChange : undefined
    });

    // ------------------------------------------------------------------------
    // ----------------------- OUTSIDE CLICK LISTENER -------------------------
    // ------------------------------------------------------------------------

    const handleOutsideClick = useCallback(() => {
        closeSidebar();

        // If the sidebar was opened on mobile, go back to the previous page when it's closed
        // The condition is needed to prevent the page from going back multiple times when the
        // user clicks outside the sidebar multiple times
        if (!useMobileParams || !searchParams.get(paramKey) || !isMobile)
            return;
        router.back();
    }, [
        closeSidebar,
        isMobile,
        router,
        searchParams,
        paramKey,
        useMobileParams
    ]);

    useLayoutEffect(() => {
        setContainerClassName(
            getContainerClassName(sidebarAnimations, isSidebarOpen)
        );
    }, [isSidebarOpen, sidebarAnimations]);

    const contentRef = useOutsideClick<HTMLDivElement>(
        enableOutsideClick ? handleOutsideClick : () => {}
    );

    return {
        isSidebarOpen,
        containerClassName,
        backdropClass,
        contentRef,
        toggleSidebar,
        openSidebar,
        closeSidebar
    };
};

function getContainerClassName(
    sidebarAnimations: SidebarAnimations,
    isSidebarOpen: boolean
) {
    return classNames(
        sidebarAnimations.position,
        isSidebarOpen ? sidebarAnimations.show : sidebarAnimations.hide
    );
}
