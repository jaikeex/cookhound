import { useCallback, useEffect, useRef } from 'react';

/**
 * Simple hook that exposes handlers disabling or enabling page scrolling on touch screens. Useful
 * for dragging lists or sidebars among others.
 */
export const useDisableMobileScroll = () => {
    const isTouchDevice = useRef(false);

    const originalBodyOverflow = useRef<string>('');

    const disableMobileScroll = useCallback(() => {
        if (isTouchDevice.current) {
            originalBodyOverflow.current =
                document.documentElement.style.overflow;
            document.documentElement.style.overflow = 'hidden';
        }
    }, []);

    const enableMobileScroll = useCallback(() => {
        if (isTouchDevice.current) {
            document.documentElement.style.overflow =
                originalBodyOverflow.current;
        }
    }, []);

    useEffect(() => {
        isTouchDevice.current =
            'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }, []);

    return { disableMobileScroll, enableMobileScroll };
};
