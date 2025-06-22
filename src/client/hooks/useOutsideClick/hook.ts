import { useCallback, useRef } from 'react';
import { useEventListener } from '@/client/hooks';

export const useOutsideClick = <T extends HTMLElement>(
    callback: () => void
) => {
    const ref = useRef<T>(null);
    const handleClickOutside = useCallback(
        (event: MouseEvent | TouchEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        },
        [callback]
    );

    useEventListener('mouseup', handleClickOutside, undefined, false);
    useEventListener('touchend', handleClickOutside, undefined, false);

    return ref;
};
