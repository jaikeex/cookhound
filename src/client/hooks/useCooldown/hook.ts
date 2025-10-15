'use client';

import { useLocalStorage } from '@/client/hooks/useLocalStorage';
import { useCallback, useEffect, useState } from 'react';

/**
 * Omni CD implementation for react.
 */
export const useCooldown = (
    cooldown: number,
    key: string,
    onError?: (error: Error) => void
) => {
    //|-----------------------------------------------------------------------------------------|//
    //?                                          STATE                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const { value: endTime, setValue: setEndTime } = useLocalStorage<
        number | null
    >(`cooldown_${key}`, null);

    const [isOnCooldown, setIsOnCooldown] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);

    //|-----------------------------------------------------------------------------------------|//
    //?                                          UPDATE                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    const updateCooldownState = useCallback(() => {
        try {
            if (!endTime) {
                setIsOnCooldown(false);
                setRemainingTime(0);
                return;
            }

            const now = Date.now();
            const remaining = Math.max(0, endTime - now);

            if (remaining <= 0) {
                // CLEAN UP
                setIsOnCooldown(false);
                setRemainingTime(0);
                setEndTime(null);
            } else {
                setIsOnCooldown(true);
                // Only update remainingTime if the difference is significant (> 100ms)
                // This prevents constant re-renders while still keeping it reasonably accurate
                setRemainingTime((prev) => {
                    const diff = Math.abs(prev - remaining);
                    return diff > 100 ? remaining : prev;
                });
            }
        } catch (error: unknown) {
            onError?.(error as Error);
        }
    }, [endTime, setEndTime, onError]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                          START                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    /**
     *  This should be the only exposed and used method to start the cd.
     *§ Do not return any other setter from this hook, only this one.
     */
    const startCooldown = useCallback(() => {
        try {
            if (cooldown <= 0) {
                onError?.(new Error('Cooldown duration must be positive'));
                return;
            }

            const endTime = Date.now() + cooldown;
            setEndTime(endTime);
            setIsOnCooldown(true);
            setRemainingTime(cooldown);
        } catch (error: unknown) {
            onError?.(error as Error);
        }
    }, [cooldown, setEndTime, onError]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                     SYNCHRONIZATION                                     ?//
    //|-----------------------------------------------------------------------------------------|//

    useEffect(() => {
        updateCooldownState();
        //§ This is important as fuck. If this fires on every function update the browser blows up.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endTime]);

    useEffect(() => {
        if (!isOnCooldown) return;

        /**
         * This is what tracks the remaining time. The interval here can be changed as needed.
         */
        const interval = setInterval(() => {
            updateCooldownState();
        }, 2000);
        return () => clearInterval(interval);
        //§ This is important as fuck. If this fires on every function update the browser blows up.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnCooldown]);

    return { startCooldown, isOnCooldown, remainingTime };
};
