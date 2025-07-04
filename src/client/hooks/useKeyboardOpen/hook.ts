'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * React hook that attempts to determine whether the on-screen keyboard is currently open on
 * touch devices.
 *
 * The hook relies primarily on the window.visualViewport API, because it fires very reliable
 * resize events whenever the visual portion of the page changes (e.g. when the keyboard
 * appears/disappears).  When the API is not available (Safari < 15, older Android, other shitty tech), it
 * falls back to listening for the regular window.resize event and comparing window.innerHeight.
 *
 *? This is (like all viewport-based heuristics) not 100 % bullet-proof because browser
 *? behaviour differs between vendors and versions. Nevertheless it works well on all
 *? modern mobile browsers that the app officially supports anyway (or it says so in the package.json...).
 *
 * @param threshold – Minimum height difference that should be treated as "keyboard opened".
 *                    150 px works well for most phones and tablets.
 *
 * @returns true while the keyboard is (very likely) open, false otherwise.
 */
export const useKeyboardOpen = (threshold: number = 150): boolean => {
    //|-----------------------------------------------------------------------------------------|//
    //?                                          STATE                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const [isOpen, setIsOpen] = useState(false);

    const baselineHeight = useRef<number | null>(null);

    //|-----------------------------------------------------------------------------------------|//
    //?                                         HANDLERS                                        ?//
    //|-----------------------------------------------------------------------------------------|//

    const handleResize = useCallback(() => {
        if (typeof window === 'undefined') return;

        const currentHeight = window.visualViewport
            ? window.visualViewport.height
            : window.innerHeight;

        if (baselineHeight.current === null) {
            baselineHeight.current = currentHeight;
            return;
        }

        const diff = baselineHeight.current - currentHeight;
        setIsOpen(diff > threshold);
    }, [threshold]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                      EVENT BINDINGS                                     ?//
    //|-----------------------------------------------------------------------------------------|//

    useEffect(() => {
        if (typeof window === 'undefined') return;

        handleResize();

        const viewport = window.visualViewport;

        if (viewport) {
            viewport.addEventListener('resize', handleResize);
            viewport.addEventListener('scroll', handleResize); // iOS fires scroll on keyboard.
            return () => {
                viewport.removeEventListener('resize', handleResize);
                viewport.removeEventListener('scroll', handleResize);
            };
        }

        // Fallback for browsers without the API.
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [handleResize]);

    return isOpen;
};
