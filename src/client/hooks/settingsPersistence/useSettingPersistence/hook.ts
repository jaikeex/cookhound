'use client';

import { useEffect, useMemo } from 'react';
import { getCookie, setCookie, deleteCookie } from '@/client/utils/cookies';
import { ONE_YEAR_IN_SECONDS } from '@/common/constants';
import { Event } from '@/client/events';
import { useAppEventListener } from '@/client/hooks';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                    WINDOW.LOCALSTORAGE                                      ?//
///
//# This hook uses local storage but does not call the in-house useLocalStorage() hook.
//# Well, it did at first, but the value saves were bugged in wierd ways, and i couldn't
//# figure out what was happening in some reasonable time, so as a fallback until i feel
//# like investigating further, window.localStorage for the win!
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

export interface UseSettingPersistenceParams<T> {
    allowedValues?: readonly T[];
    canPersist: boolean;
    cookieMaxAge?: number;
    currentValue: T | undefined;
    storageKey: string;
    // Called on first mount and whenever consent flips to true, if a previously persisted value was found.
    onRestore?: (value: T) => void;
    onPersist?: (value: T) => void;
    serialize?: (value: T) => string;
    deserialize?: (raw: string) => T | null;
}

const defaultSerialize = <T>(value: T) => JSON.stringify(value);

const defaultDeserialize = <T>(raw: string) => {
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
};

export const useSettingPersistence = <T>(
    params: UseSettingPersistenceParams<T>
): void => {
    const {
        storageKey,
        currentValue,
        canPersist,
        onRestore,
        onPersist,
        serialize = defaultSerialize,
        deserialize = defaultDeserialize,
        allowedValues,
        cookieMaxAge = ONE_YEAR_IN_SECONDS
    } = params;

    // Clean up immediately on mount if there is no consent
    useEffect(() => {
        if (typeof window === 'undefined' || canPersist) return;

        window.localStorage.removeItem(storageKey);
        deleteCookie(storageKey);
    }, [canPersist, storageKey]);

    // Restore the value from the cookie or localStorage
    const restored = useMemo((): T | undefined => {
        if (!canPersist || typeof window === 'undefined') {
            return undefined;
        }

        const rawFromLs = window.localStorage.getItem(storageKey);
        const rawFromCookie = rawFromLs ?? getCookie(storageKey);

        if (!rawFromCookie) {
            return undefined;
        }

        const parsed = deserialize(rawFromCookie);

        if (parsed == null) {
            return undefined;
        }

        if (allowedValues && !allowedValues.includes(parsed)) {
            return undefined;
        }

        return parsed;
    }, [canPersist, storageKey, deserialize, allowedValues]);

    // Hydrate external state once
    useEffect(() => {
        if (restored === undefined || !onRestore) return;

        onRestore(restored);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restored]);

    // Persist whenever the value or consent changes
    useEffect(() => {
        if (currentValue === undefined) return;

        if (!canPersist) {
            // Consent revoked wipe everything
            deleteCookie(storageKey);

            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(storageKey);
            }

            return;
        }

        const serialized = serialize(currentValue);

        if (typeof window !== 'undefined') {
            const currentStored = window.localStorage.getItem(storageKey);

            if (currentStored === serialized) {
                return;
            }
        }

        setCookie(storageKey, serialized, {
            maxAge: cookieMaxAge
        });

        if (typeof window !== 'undefined') {
            window.localStorage.setItem(storageKey, serialized);
        }

        //?—————————————————————————————————————————————————————————————————————————————————————?//
        //?                              FOR PRIVATE INVESTIGATORS                              ?//
        ///
        //# IF (or rather WHEN) a bug investigation leads to this point and the onPersist?.()
        //# call is not happening for some handled value, go investigate the order of operations
        //# first. If the value is already saved in local storage from elsewhere (which happens
        //# sometimes if the value comes from 3rd party library), the check above
        //#     if (currentStored === serialized) { return; }
        //# will trigger and this hook will return early without ever calling the server to
        //# save the value.
        //# If that is not the case, you're fucked, because reordering things here or omitting
        //# the check leads to even bigger problems...
        ///
        //?—————————————————————————————————————————————————————————————————————————————————————?//

        onPersist?.(currentValue);
    }, [
        currentValue,
        canPersist,
        serialize,
        storageKey,
        cookieMaxAge,
        onPersist
    ]);

    useAppEventListener(Event.CONSENT_CHANGED, () => {
        if (typeof window === 'undefined' || canPersist) return;

        window.localStorage.removeItem(storageKey);

        deleteCookie(storageKey);
    });
};
