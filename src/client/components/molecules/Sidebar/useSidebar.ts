'use client';

import { useCallback, useState, useRef } from 'react';
import {
    useDisableMobileScroll,
    useOutsideClick,
    useParamsChangeListener,
    usePathnameChangeListener,
    useScreenSize
} from '@/client/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SidebarAnimations, SidebarConfig } from './types';
import { classNames } from '@/client/utils';

const DEFAULT_ANIMATIONS = {
    sidebar: {
        left: {
            position: 'fixed left-0 top-0 h-[100dvh]',
            show: 'animate-slide-from-left',
            hide: 'animate-slide-to-left'
        },
        right: {
            position: 'fixed right-0 top-0 h-[100dvh]',
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

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //$                                         OPTIONS                                         $//
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

    ///=========================================================================================///
    ///                                      CORE STATE DATA                                    ///
    ///=========================================================================================///

    // Reflects the current open/closed state of the sidebar. This is the only absolute truth.
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Styles that need to be added to their matching components in the caller component.
    const [backdropClass, setBackdropClass] = useState(backdropAnimations.show);
    const [containerClassName, setContainerClassName] = useState(
        getContainerClassName(sidebarAnimations, isSidebarOpen)
    );

    /**
     * These refs serve as a method to lock the sidebar toggle from being called multiple times
     * while the opening/closing is in progress.
     */
    const isOpeningRef = useRef(false);
    const isClosingRef = useRef(false);

    const { disableMobileScroll, enableMobileScroll } =
        useDisableMobileScroll();

    ///=========================================================================================///
    ///                                           ROUTING                                       ///
    ///=========================================================================================///

    /**
     * These are values used for handling any url related activity.
     */

    //? There must be a better way to work arount this...
    //TODO: FIND A BETTER SOLUTION
    const lastPathnameRef: React.RefObject<string | null> = useRef(null);

    const { isMobile } = useScreenSize();
    const router = useRouter();
    const searchParams = useSearchParams();

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //$                                 OPENING/CLOSING HANDLERS                                $//
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

    //?—————————————————————————————————————————————————————————————————————————————————————————?//
    //?                                     -> IMPORTANT <-                                      //
    ///
    //# These functions together handle the core logic of opening/closing the sidebar.
    //#
    //# They need to manage everything including the isSidebarOpen state, styles and animations.
    //# The process uses ref-based locking mechanism to prevent any conflicting invocations.
    //# (Should not be necessary when calling things correctly all the time but fuck me...)
    //#
    //~ Only the toggleSidebar() handler should be called directly to switch the sidebar state.
    //~ All other functions should be considered private to this 'section'
    //~ for all intents and purposes
    ///
    //?—————————————————————————————————————————————————————————————————————————————————————————?//

    const toggleSidebarWithAnimation = useCallback(
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

    const closeSidebar = useCallback(() => {
        isClosingRef.current = true;
        toggleSidebarWithAnimation(false);

        enableMobileScroll();
        document.documentElement.style.overscrollBehavior = 'auto';

        setTimeout(() => {
            isClosingRef.current = false;
        }, 200);

        //?—————————————————————————————————————————————————————————————————————————————————————?//
        //?                                   MOBILE PARAMS                                     ?//
        ///
        //# If the sidebar was opened on mobile, go back to the previous page when it's closed
        //# The condition is needed to prevent the page from going back multiple times when the
        //# user clicks outside the sidebar multiple times.
        //#
        //?  This unfortunately seems like the best place to put it. If called from the url
        //?  management functions then multiple cases would be left out...
        //TODO: Can this be solved in some other way?
        ///
        //?—————————————————————————————————————————————————————————————————————————————————————?//

        if (!useMobileParams || !searchParams.get(paramKey) || !isMobile) {
            return;
        }

        router.back();
    }, [
        toggleSidebarWithAnimation,
        enableMobileScroll,
        useMobileParams,
        searchParams,
        paramKey,
        isMobile,
        router
    ]);

    const openSidebar = useCallback(() => {
        isOpeningRef.current = true;

        toggleSidebarWithAnimation(true);

        disableMobileScroll();

        /**
         * This prohibits the browser from reloading when the user swipes down (among other things).
         * If this was not set, every time the user would try to close the sidebar by swiping down,
         * the page would reload instead. Not ideal...
         */
        document.documentElement.style.overscrollBehavior = 'contain';

        setTimeout(() => {
            isOpeningRef.current = false;
        }, 200);
    }, [disableMobileScroll, toggleSidebarWithAnimation]);

    /**
     * Toggles the state of the sidebar.
     *
     *!This is the ONLY function that should be used for switching the state inside this hook or exported.
     */
    const toggleSidebar = useCallback(() => {
        if (isOpeningRef.current || isClosingRef.current) return;

        if (isSidebarOpen) closeSidebar();
        else {
            openSidebar();

            // On mobile screens, the sidebar is opened with a query parameter to facilitate the back/forward navigation
            if (useMobileParams && isMobile) {
                const params = new URLSearchParams(searchParams);
                params.set(paramKey, 'true');
                router.push(`?${params.toString()}`, { scroll: false });
            }
        }
    }, [
        isSidebarOpen,
        closeSidebar,
        openSidebar,
        useMobileParams,
        isMobile,
        searchParams,
        paramKey,
        router
    ]);

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //$                              PARAMS and PATHNAME LISTENERS                              $//
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

    ///=========================================================================================///
    ///                                           PARAMS                                        ///
    ///=========================================================================================///

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
            toggleSidebar();
        }

        if (
            typeof window !== 'undefined' &&
            lastPathnameRef.current !== window.location.pathname
        ) {
            lastPathnameRef.current = window.location.pathname;
            return;
        }
    }, [searchParams, paramKey, isSidebarOpen, router, toggleSidebar]);

    // Only set up params listener if mobile params are enabled
    useParamsChangeListener({
        key: paramKey,
        onChange: useMobileParams ? handleParamsChange : undefined
    });

    ///=========================================================================================///
    ///                                          PATHNAME                                       ///
    ///=========================================================================================///

    const handlePathnameChange = useCallback(() => {
        //———————————————————————————————————————————————————————————————————————————————————————//
        //                                 CLOSE ON PATH CHANGE                                  //
        //
        // Close the sidebar when the user navigates to a different page directly from the sidebar.
        // This mainly applies to desktop screens, where the query parameter is not used, and so the
        // params change listener does not fire.
        // On mobile screens this serves as redundancy.
        //
        //———————————————————————————————————————————————————————————————————————————————————————//

        // Don't close if we're currently in the process of opening the sidebar
        if (isOpeningRef.current || isClosingRef.current) return;

        if (!searchParams.get(paramKey) && isSidebarOpen) toggleSidebar();

        if (typeof window !== 'undefined') {
            lastPathnameRef.current = window.location.pathname;
        }
    }, [searchParams, paramKey, isSidebarOpen, toggleSidebar]);

    // Only set up pathname listener if enabled
    usePathnameChangeListener({
        onChange: closeOnPathnameChange ? handlePathnameChange : undefined
    });

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //$                                  OUTSIDE CLICK LISTENER                                 $//
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

    const contentRef = useOutsideClick<HTMLDivElement>(
        enableOutsideClick ? toggleSidebar : () => {}
    );

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //$                                         RETURN                                          $//
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

    return {
        isSidebarOpen,
        containerClassName,
        backdropClass,
        contentRef,
        toggleSidebar
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
