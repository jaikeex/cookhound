'use client';

import { useCallback, useState } from 'react';
import {
    useOutsideClick,
    useParamsChangeListener,
    usePathnameChangeListener,
    useScreenSize
} from '@/client/hooks';
import { useRouter, useSearchParams } from 'next/navigation';

const MENU_PARAM_KEY = 'menu-open';

const ANIMATIONS = {
    menu: {
        show: 'animate-slide-from-right md:animate-fade-in',
        hide: 'animate-slide-to-right md:animate-fade-out'
    },
    backdrop: {
        show: 'animate-fade-in-slow',
        hide: 'animate-fade-out-slow'
    }
};

export const useNavigationMenu = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuClass, setMenuClass] = useState(ANIMATIONS.menu.show);
    const [backdropClass, setBackdropClass] = useState(
        ANIMATIONS.backdrop.show
    );

    const { isMobile } = useScreenSize();
    const router = useRouter();
    const searchParams = useSearchParams();

    // ------------------------------------------------------------------------
    // ----------------------- IsMenuOpen STATE HANDLERS ----------------------
    // ------------------------------------------------------------------------

    const setIsMenuOpenWithAnimation = useCallback(
        (open: boolean) => {
            // Timeout for the state change is needed to prevent flickering when closing the menu, since the animation
            // is not instant. The time is purposefully set to 10 ms less than the animation duration to ensure
            // the state change happens before the animation ends and starts the second time.
            const timeout = open ? 0 : isMobile ? 290 : 140;
            setMenuClass(open ? ANIMATIONS.menu.show : ANIMATIONS.menu.hide);
            setBackdropClass(
                open ? ANIMATIONS.backdrop.show : ANIMATIONS.backdrop.hide
            );
            setTimeout(() => setIsMenuOpen(open), timeout);
        },
        [isMobile]
    );

    const closeMenu = useCallback(
        () => setIsMenuOpenWithAnimation(false),
        [setIsMenuOpenWithAnimation]
    );

    const openMenu = useCallback(
        () => setIsMenuOpenWithAnimation(true),
        [setIsMenuOpenWithAnimation]
    );

    const toggleMenu = useCallback(() => {
        if (isMenuOpen) closeMenu();
        else {
            // On mobile screens, the menu is opened with a query parameter to facilitate the back/forward navigation
            isMobile && router.push(`?${MENU_PARAM_KEY}=true`);
            openMenu();
        }
    }, [closeMenu, isMenuOpen, isMobile, openMenu, router]);

    // ------------------------------------------------------------------------
    // -------------------- SEARCH PARAMS CHANGE LISTENER ---------------------
    // ------------------------------------------------------------------------

    const handleParamsChange = useCallback(() => {
        if (searchParams.get(MENU_PARAM_KEY) && !isMenuOpen) {
            // This fires when the user navigates through the browser history to a page state with an open menu
            // The menu is then opened to prevent the back/forward actions from appearing as a dead step
            openMenu();
        } else if (!searchParams.get(MENU_PARAM_KEY) && isMenuOpen) {
            // This fires in two different cases:
            // (1) the user opens a link from inside the menu
            // (2) the user clicks the back/forward button with the menu open
            // In both cases, the menu is closed
            closeMenu();
        }
    }, [closeMenu, isMenuOpen, openMenu, searchParams]);

    useParamsChangeListener({
        key: MENU_PARAM_KEY,
        onChange: handleParamsChange
    });

    // ------------------------------------------------------------------------
    // ----------------------- PATHNAME CHANGE LISTENER -----------------------
    // ------------------------------------------------------------------------

    const handlePathnameChange = useCallback(() => {
        // Close the menu when the user navigates to a different page directly from the menu.
        // This mainly applies to desktop screens, where the query parameter is not used, and so the
        // params change listener does not fire.
        // On mobile screens this serves as redundancy.
        if (!searchParams.get(MENU_PARAM_KEY)) closeMenu();
    }, [closeMenu, searchParams]);

    usePathnameChangeListener({
        onChange: handlePathnameChange
    });

    // ------------------------------------------------------------------------
    // ----------------------- OUTSIDE CLICK LISTENER -------------------------
    // ------------------------------------------------------------------------

    const handleOutsideClick = useCallback(() => {
        closeMenu();

        // If the menu was opened on mobile, go back to the previous page when it's closed
        // The condition is needed to prevent the page from going back multiple times when the
        // user clicks outside the menu multiple times
        if (!searchParams.get(MENU_PARAM_KEY) || !isMobile) return;
        router.back();
    }, [closeMenu, isMobile, router, searchParams]);

    const menuRef = useOutsideClick<HTMLDivElement>(handleOutsideClick);

    return {
        isMenuOpen,
        menuClass,
        backdropClass,
        menuRef,
        toggleMenu
    };
};
