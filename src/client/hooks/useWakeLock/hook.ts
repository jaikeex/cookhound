'use client';

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore
} from 'react';

export type UseWakeLockResult = Readonly<{
    isActive: boolean;
    isSupported: boolean;
    disable: () => Promise<void>;
    enable: () => Promise<boolean>;
    toggle: () => Promise<boolean>;
}>;

/**
 * Support cannot change over the lifetime of the document, so there is nothing
 * to subscribe to - the store exists only to keep the server and hydration
 * snapshots separate from the client one.
 */
const subscribe = () => () => {};

const getSnapshot = () =>
    typeof navigator !== 'undefined' && 'wakeLock' in navigator;

//! Do not guess here. React uses this snapshot for the hydration pass, and any
//! guess that disagrees with the real client becomes a mismatch.
const getServerSnapshot = () => false;

export const useWakeLock = (): UseWakeLockResult => {
    const isSupported = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    );

    const [isActive, setIsActive] = useState(false);

    const sentinelRef = useRef<WakeLockSentinel | null>(null);

    //~——————————————————————————————————————————————————————————————————————~//
    //$                          INTENT VS. REALITY                          $//
    ///
    //# The browser drops a screen wake lock every time the page is hidden - a
    //# tab switch, an app switch, the phone locking - and never restores it on
    //# its own. isActive is therefore what the browser currently grants,
    //# while this ref is what the user actually asked for. The visibility
    //# listener below closes the gap between the two.
    ///
    //~——————————————————————————————————————————————————————————————————————~//

    const desiredRef = useRef(false);

    // The sentinel check below only sees locks that have already been granted.
    // Without sharing the in-flight request, two overlapping callers (a double
    // tap, or a tap during the visibility re-request) would each acquire a
    // sentinel, and the one overwritten in sentinelRef could never be released.
    const pendingRef = useRef<Promise<boolean> | null>(null);

    const request = useCallback((): Promise<boolean> => {
        if (!isSupported || !desiredRef.current) return Promise.resolve(false);

        // Requesting while the document is hidden throws, so this is a real
        // precondition rather than defensive padding.
        if (document.visibilityState !== 'visible') {
            return Promise.resolve(false);
        }

        if (sentinelRef.current && !sentinelRef.current.released) {
            return Promise.resolve(true);
        }

        if (pendingRef.current) return pendingRef.current;

        const pending = (async (): Promise<boolean> => {
            try {
                const sentinel = await navigator.wakeLock.request('screen');

                if (!desiredRef.current) {
                    await sentinel.release();
                    return false;
                }

                sentinel.addEventListener('release', () => {
                    if (sentinelRef.current === sentinel) setIsActive(false);
                });

                sentinelRef.current = sentinel;
                setIsActive(true);

                return true;
            } catch {
                setIsActive(false);
                return false;
            }
        })();

        pendingRef.current = pending;

        void pending.finally(() => {
            if (pendingRef.current === pending) pendingRef.current = null;
        });

        return pending;
    }, [isSupported]);

    const release = useCallback(async () => {
        const sentinel = sentinelRef.current;

        sentinelRef.current = null;
        setIsActive(false);

        if (!sentinel || sentinel.released) return;

        try {
            await sentinel.release();
        } catch {
            // Already gone - nothing left to release.
        }
    }, []);

    const enable = useCallback(() => {
        desiredRef.current = true;
        return request();
    }, [request]);

    const disable = useCallback(() => {
        desiredRef.current = false;
        return release();
    }, [release]);

    const toggle = useCallback(async () => {
        if (isActive) {
            await disable();
            return false;
        }

        return enable();
    }, [disable, enable, isActive]);

    // Take back whatever the browser released while the page was hidden.
    useEffect(() => {
        if (!isSupported) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState !== 'visible') return;
            void request();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
        };
    }, [isSupported, request]);

    // The lock is scoped to the view that asked for it.
    useEffect(
        () => () => {
            desiredRef.current = false;

            const sentinel = sentinelRef.current;
            sentinelRef.current = null;

            if (sentinel && !sentinel.released) {
                sentinel.release().catch(() => {});
            }
        },
        []
    );

    return { isActive, isSupported, disable, enable, toggle };
};
