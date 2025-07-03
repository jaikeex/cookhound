'use client';

import { useCallback, useEffect, useState } from 'react';
import { BREAKPOINTS } from '@/client/constants';
import { useEventListener } from '@/client/hooks';

export const useScreenSize = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    const handleResize = useCallback(() => {
        const width = window.innerWidth;
        setIsMobile(width < BREAKPOINTS.tablet);
        setIsTablet(width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop);
        setIsDesktop(width >= BREAKPOINTS.desktop);
    }, []);

    useEventListener('resize', handleResize);

    useEffect(() => {
        handleResize();
    }, [handleResize]);

    return { isMobile, isTablet, isDesktop };
};
