'use client';

import { useEffect } from 'react';
import { eventBus, type Event } from '@/client/events';

/**
 * Simple hook to listen to app events. If any advanced needs come up, use the EventBus directly.
 *
 * @param event - The event to listen to.
 * @param callback - The callback to call when the event is emitted.
 */
export const useAppEventListener = (
    event: Event,
    callback: (payload?: any) => void
) => {
    useEffect(() => {
        eventBus.on(event, callback);

        return () => {
            eventBus.off(event, callback);
        };
    }, [event, callback]);
};
