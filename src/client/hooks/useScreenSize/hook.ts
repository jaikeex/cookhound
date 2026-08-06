'use client';

import { useSyncExternalStore } from 'react';
import { BREAKPOINTS } from '@/client/constants';

export type ScreenSize = Readonly<{
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}>;

type Band = 'mobile' | 'tablet' | 'desktop';

type Matchers = Readonly<{
    tablet: MediaQueryList;
    desktop: MediaQueryList;
}>;

/**
 * One shared snapshot per band. useSyncExternalStore compares snapshots with
 * Object.is, so handing back a constant (rather than a fresh object) is what
 * keeps a resize within a band from re-rendering a single consumer.
 */
const SNAPSHOTS: Record<Band, ScreenSize> = {
    mobile: { isMobile: true, isTablet: false, isDesktop: false },
    tablet: { isMobile: false, isTablet: true, isDesktop: false },
    desktop: { isMobile: false, isTablet: false, isDesktop: true }
};

/**
 * The band is unknowable without a window, so the server render and the
 * hydration render both report "no band"- identical to the initial state of
 * the previous implementation, and the reason server and client markup agree.
 *
 *! Do not guess a band here. React uses this snapshot for the hydration pass,
 *! and any guess that disagrees with the real viewport becomes a mismatch.
 */
const SERVER_SNAPSHOT: ScreenSize = {
    isMobile: false,
    isTablet: false,
    isDesktop: false
};

const QUERIES = {
    tablet: `(min-width: ${BREAKPOINTS.tablet}px)`,
    desktop: `(min-width: ${BREAKPOINTS.desktop}px)`
} as const;

let matchers: Matchers | null = null;
let snapshot: ScreenSize = SERVER_SNAPSHOT;

const listeners = new Set<() => void>();

const readBand = (current: Matchers): Band => {
    if (current.desktop.matches) return 'desktop';
    if (current.tablet.matches) return 'tablet';
    return 'mobile';
};

const handleQueryChange = () => {
    if (!matchers) {
        return;
    }

    const next = SNAPSHOTS[readBand(matchers)];

    // Crossing a breakpoint is the only event consumers can observe.
    if (next === snapshot) {
        return;
    }

    snapshot = next;
    listeners.forEach((notify) => notify());
};

/**
 * Builds the two MediaQueryLists backing the store.
 *
 * The change listeners are never detached. Two idle matchers cost
 * nothing, and keeping them alive means the snapshot is already correct for
 * components that mount after hydration: they render the right band on their
 * first pass instead of correcting themselves in an effect.
 */
const ensureStore = () => {
    if (matchers || typeof window === 'undefined') {
        return;
    }

    matchers = {
        tablet: window.matchMedia(QUERIES.tablet),
        desktop: window.matchMedia(QUERIES.desktop)
    };

    matchers.tablet.addEventListener('change', handleQueryChange);
    matchers.desktop.addEventListener('change', handleQueryChange);

    snapshot = SNAPSHOTS[readBand(matchers)];
};

const subscribe = (notify: () => void) => {
    ensureStore();
    listeners.add(notify);

    return () => {
        listeners.delete(notify);
    };
};

const getSnapshot = (): ScreenSize => {
    ensureStore();
    return snapshot;
};

const getServerSnapshot = (): ScreenSize => SERVER_SNAPSHOT;

/**
 * Subscribes a component to breakpoint changes.
 *
 * Use this only when the breakpoint drives what gets rendered. If the value is
 * read inside an event handler, prefer getScreenSize, subscribing to a
 * value you never render is pure overhead.
 */
export const useScreenSize = (): ScreenSize =>
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

/**
 * Reads the current breakpoint without subscribing to it, for event handlers
 * and other imperative code where the value only matters at call time.
 *
 * Returns the SSR snapshot (all flags false) when there is no window.
 *
 *! Never call this during render! It returns the real band on the client
 *! and the all-false snapshot on the server, which is a hydration mismatch,
 *! and it will not re-render on breakpoint change. In render, use useScreenSize.
 */
export const getScreenSize = (): ScreenSize => {
    ensureStore();
    return snapshot;
};
