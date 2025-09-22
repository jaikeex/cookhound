import { type RefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { useEventListener } from '@/client/hooks/useEventListener';

export interface UseKeyPressOptions<
    E extends HTMLElement | Window | void = void
> {
    readonly eventType?: 'keydown' | 'keyup' | 'keypress';
    readonly element?: RefObject<E>;
    readonly enabled?: boolean;
    readonly preventDefault?: boolean;
    readonly stopPropagation?: boolean;
}

export const useKeyPress = <E extends HTMLElement | Window | void = void>(
    key: string | ReadonlyArray<string>,
    callback: (event: KeyboardEvent) => void,
    {
        eventType = 'keydown',
        element,
        enabled = true,
        preventDefault = false,
        stopPropagation = false
    }: UseKeyPressOptions<E> = {}
) => {
    const savedCallback = useRef(callback);
    const keys = useMemo(() => (Array.isArray(key) ? key : [key]), [key]);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    const handler = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return;

            if (keys.includes(event.key)) {
                if (preventDefault) event.preventDefault();
                if (stopPropagation) event.stopPropagation();
                savedCallback.current(event);
            }
        },
        [enabled, keys, preventDefault, stopPropagation]
    );

    useEventListener<KeyboardEvent, E>(eventType, handler, element, {
        passive: !preventDefault
    });
};
