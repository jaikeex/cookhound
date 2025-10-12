'use client';

import {
    type Dispatch,
    type SetStateAction,
    useState,
    useEffect,
    useCallback,
    useRef
} from 'react';
import { useEventListener } from '@/client/hooks/useEventListener';

type UseLocalStorageOptions<T> = {
    /** Custom serializer function. Defaults to JSON.stringify. */
    serializer?: (value: T) => string;
    /** Custom deserializer function. Defaults to JSON.parse. */
    deserializer?: (value: string) => T;
    /** Whether to sync state across browser tabs. Defaults to true. */
    syncAcrossTabs?: boolean;
    /** Callback function called when an error occurs. */
    onError?: (error: Error) => void;
};

type UseLocalStorageReturn<T> = {
    value: T;
    setValue: Dispatch<SetStateAction<T>>;
    removeValue: () => void;
};

/**
 * Custom React hook for managing values in the browser's localStorage.
 * Automatically syncs state across components and browser tabs.
 *
 * ~If the user does not provide an onError callback inside the options, all errors will be rethrown.
 *
 * I shamelessly copied this from my job, then made it better, but did not tell them.
 * @template T - The type of the value to be stored in localStorage.
 * @param {string} key - The key under which the value will be stored in localStorage.
 * @param {T} initialValue - The initial value to use if no value exists in localStorage.
 * @param {UseLocalStorageOptions<T>} [options] - Optional configuration options.
 * @returns {UseLocalStorageReturn<T>} Object containing the current value, setter, remover, and error state.
 */
export const useLocalStorage = <T>(
    key: string,
    initialValue: T,
    options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> => {
    //~-----------------------------------------------------------------------------------------~//
    //$                                          STATE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    const {
        onError,
        serializer = JSON.stringify,
        deserializer = JSON.parse,
        syncAcrossTabs = true
    } = options;

    const [isHydrated, setIsHydrated] = useState(false);
    const isFirstRender = useRef(true);

    /**
     * Do everything needed when something fails. Everything that can fail inside this hook
     * should call this function when it does.
     */
    const handleError = useCallback(
        (err: unknown) => {
            const error = err instanceof Error ? err : new Error(String(err));

            /**
             * Handle the error if the user has provided a callback. Fuck them otherwise.
             */
            if (onError) {
                onError(error);
            } else {
                throw error;
            }
        },
        [onError]
    );

    //~-----------------------------------------------------------------------------------------~//
    //$                                          READ                                           $//
    //~-----------------------------------------------------------------------------------------~//

    const readValue = useCallback((): T => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);

            if (item === null) {
                return initialValue;
            }

            return deserializer(item);
        } catch (error: unknown) {
            handleError(error);
            return initialValue;
        }
    }, [initialValue, key, deserializer, handleError]);

    /**
     * INITIALIZE THE MAIN STATE HERE
     * This is the value that should be relied upon on the client to contain the most up to date value.
     */
    const [storedValue, setStoredValue] = useState<T>(() => {
        // On the server return initialValue immediately to avoid hydration mismatch.
        if (typeof window === 'undefined') {
            return initialValue;
        }

        return readValue() ?? initialValue;
    });

    //~-----------------------------------------------------------------------------------------~//
    //$                                          WRITE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    const setValue: Dispatch<SetStateAction<T>> = useCallback(
        (value) => {
            if (typeof window === 'undefined') {
                return;
            }

            try {
                //?—————————————————————————————————————————————————————————————————————————————?//
                //?                              SET STATE MIMICK                               ?//
                ///
                //# This check is actually important. By allowing the passed in value to be a
                //# function, this setter can mimick a regular react state setter.
                //# Type support included.
                //#
                //# Allways remember to pass along the currently stored value (prev).
                //# Also i found the safest way to avoid shitty stale updates
                //# is to call it with the FRESHEST value obtainable - reading from ls itself.
                ///
                //?—————————————————————————————————————————————————————————————————————————————?//

                const newValue =
                    value instanceof Function ? value(readValue()) : value;

                window.localStorage.setItem(key, serializer(newValue));

                setStoredValue(newValue);

                // The save is complete, tell all other callers to update.
                window.dispatchEvent(
                    new CustomEvent('local-storage-change', {
                        detail: { key, newValue }
                    })
                );
            } catch (error: unknown) {
                handleError(error);
            }
        },
        [key, readValue, serializer, handleError]
    );

    //~-----------------------------------------------------------------------------------------~//
    //$                                         DELETE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    const removeValue = useCallback(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            window.localStorage.removeItem(key);
            // Do NOT set this as null or undefined. Subscribers should be able to rely on getting
            // the default value back.
            setStoredValue(initialValue);

            // The delete is complete, tell all other callers to update.
            window.dispatchEvent(
                new CustomEvent('local-storage-change', {
                    detail: { key, newValue: initialValue }
                })
            );
        } catch (error: unknown) {
            handleError(error);
        }
    }, [key, initialValue, handleError]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                          SYNC                                           $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * This updates the state when matching ls event is fired from someplace else.
     */
    const handleStorageChange = useCallback(
        (e: StorageEvent | CustomEvent) => {
            if (!syncAcrossTabs) return;

            let eventKey: string | null = null;

            if (e instanceof StorageEvent) {
                eventKey = e.key;
            } else if (e instanceof CustomEvent && e.detail) {
                eventKey = e.detail.key;
            }

            if (eventKey === key) {
                const newValue = readValue();
                setStoredValue(newValue);
            }
        },
        [key, readValue, syncAcrossTabs]
    );

    // Listen for storage events (cross-tab changes)
    useEventListener('storage', handleStorageChange);

    // Listen for custom events (same-tab changes from other components)
    useEventListener('local-storage-change', handleStorageChange);

    // INITIAL HYDRATION
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            setIsHydrated(true);
        }
    }, []);

    // Return the hydrated value on client, initialValue on server
    const returnValue = isHydrated ? storedValue : initialValue;

    return {
        value: returnValue,
        setValue,
        removeValue
    };
};
