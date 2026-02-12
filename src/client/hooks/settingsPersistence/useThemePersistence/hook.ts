'use client';

import { useCallback } from 'react';
import { useTheme, useConsent } from '@/client/store';
import { THEME_STORAGE_KEY } from '@/client/constants';
import { chqc } from '@/client/request/queryClient';
import type { UserPreferences } from '@/common/types';
import { useSettingPersistence } from '@/client/hooks/settingsPersistence';

/**
 * Persist and restore the user's selected theme if the user granted consent.
 */
export const useThemePersistence = (userId?: number): void => {
    const { resolvedTheme, setTheme } = useTheme();
    const { canUsePreferences } = useConsent();

    const { mutate: updateUserPreferences } =
        chqc.user.useUpdateUserPreferences();

    const handleRestore = useCallback(
        (theme: string) => {
            setTheme(theme as Parameters<typeof setTheme>[0]);
        },
        [setTheme]
    );

    const handlePersist = useCallback(
        (theme: string) => {
            if (userId && userId > 0) {
                updateUserPreferences({
                    userId: userId,
                    data: { theme: theme as UserPreferences['theme'] }
                });
            }
        },
        [updateUserPreferences, userId]
    );

    useSettingPersistence<string>({
        storageKey: THEME_STORAGE_KEY,
        currentValue: resolvedTheme,
        canPersist: canUsePreferences,
        allowedValues: ['light', 'dark', 'system'] as const,
        onRestore: handleRestore,
        onPersist: handlePersist,
        serialize: (value: string) => value,
        deserialize: (raw: string) => raw
    });
};
