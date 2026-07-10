'use client';

import { useCallback } from 'react';
import { useLocale } from '@/client/store';
import { chqc } from '@/client/data';
import type { UserPreferences } from '@/common/types';
import { useSettingPersistence } from '@/client/hooks/settingsPersistence';
import { LOCALE_STORAGE_KEY } from '@/client/constants';

/**
 * Persists the user's selected locale.
 *
 * The locale is treated as a strictly-necessary / functional setting: it is
 * persisted (cookie + localStorage, and the user's DB preferences when logged
 * in) regardless of cookie-consent state, so an anonymous visitor's explicit
 * language choice is remembered.
 */
export const useLocalePersistence = (userId?: number): void => {
    const { locale, localeResolved } = useLocale();

    const { mutate: updateUserPreferences } =
        chqc.user.useUpdateUserPreferences();

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
        // Withhold the value until LocaleProvider has resolved the locale from
        // the cookie. useSettingPersistence skips persistence while currentValue
        // is undefined, so the first render's default can never clobber a
        // returning visitor's saved choice.
        currentValue: localeResolved ? locale : undefined,
        canPersist: true,
        allowedValues: ['en', 'cs'] as const,
        onPersist: handlePersist,
        serialize: (value: string) => value,
        deserialize: (raw: string) => raw
    });
};
