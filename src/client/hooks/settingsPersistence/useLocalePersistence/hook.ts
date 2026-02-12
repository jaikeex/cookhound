'use client';

import { useCallback } from 'react';
import { useLocale } from '@/client/store';
import { useConsent } from '@/client/store';
import { chqc } from '@/client/request/queryClient';
import type { UserPreferences } from '@/common/types';
import { useSettingPersistence } from '@/client/hooks/settingsPersistence';
import { LOCALE_STORAGE_KEY } from '@/client/constants';

/**
 * Persist and restore the user's selected locale if the user granted consent.
 */
export const useLocalePersistence = (userId?: number): void => {
    const { locale, setLocale } = useLocale();
    const { canUsePreferences } = useConsent();

    const { mutate: updateUserPreferences } =
        chqc.user.useUpdateUserPreferences();

    const handleRestore = useCallback(
        (loc: string) => setLocale(loc as Parameters<typeof setLocale>[0]),
        [setLocale]
    );

    const handlePersist = useCallback(
        (loc: string) => {
            if (userId && userId > 0) {
                updateUserPreferences({
                    userId: userId,
                    data: { locale: loc as UserPreferences['locale'] }
                });
            }
        },
        [updateUserPreferences, userId]
    );

    useSettingPersistence<string>({
        storageKey: LOCALE_STORAGE_KEY,
        currentValue: locale,
        canPersist: canUsePreferences,
        allowedValues: ['en', 'cs'] as const,
        onRestore: handleRestore,
        onPersist: handlePersist,
        serialize: (value: string) => value,
        deserialize: (raw: string) => raw
    });
};
