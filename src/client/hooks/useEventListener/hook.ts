'use client';

import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

/**
 * Custom React hook for managing event listeners. Automatically removes the event listener when the component
 * unmounts. Can be used to listen for events on the window, an HTMLElement, or a MediaQueryList. If no element is
 * provided, the event listener will be attached to the window.
 *
 * @template E - Type parameter representing the event type (Event by default).
 * @template T - Type parameter representing the target element type (HTMLElement, MediaQueryList, or void).
 *
 * @param {string} eventName - The name of the event to listen for.
 * @param {(event: E) => void} handler - The event handler function.
 * @param {RefObject<T>} [element] - Optional reference to the target element (HTMLElement or MediaQueryList).
 * @param {boolean | AddEventListenerOptions} [options] - Optional event listener options.
 */
export const useEventListener = <
    E extends Event = Event,
    T extends HTMLElement | MediaQueryList | Window | void = void
>(
    eventName: string,
    handler: (event: E) => void,
    element?: RefObject<T>,
    options?: boolean | AddEventListenerOptions
) => {
    const savedHandler = useRef(handler);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const targetElement: T | Window = element?.current ?? window;

        if (!(targetElement && targetElement.addEventListener)) return;

        const listener = (event: Event) => savedHandler.current(event as E);

        targetElement.addEventListener(eventName, listener, options);

        return () => {
            targetElement.removeEventListener(eventName, listener, options);
        };
    }, [eventName, element, options]);
};
