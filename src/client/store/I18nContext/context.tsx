'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import type { I18nMessage, Locale, Messages } from '@/client/locales';
import { locales } from '@/client/locales';
import { setLocaleCookie } from '@/app/actions';
import { getCookieValue } from '@/client/utils';

type LocaleContextType = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    messages: Record<string, string>;
    t: (
        key: I18nMessage | undefined,
        params?: Record<string, string | number | boolean>
    ) => string;
};

const LocaleContext = createContext({} as LocaleContextType);

export const useLocale = () => {
    const context = useContext(LocaleContext);

    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }

    return context;
};

type LocaleProviderProps = Readonly<{
    defaultMessages: Messages;
    defaultLocale: Locale;
}> &
    React.PropsWithChildren<NonNullable<unknown>>;

export const LocaleProvider: React.FC<LocaleProviderProps> = ({
    children,
    defaultMessages,
    defaultLocale
}) => {
    const [locale, setLocale] = useState<Locale>(defaultLocale);
    const [messages, setMessages] = useState<Messages>(defaultMessages);
    const t = useCallback(
        (
            key: I18nMessage | undefined,
            params?: Record<string, string | number | boolean>
        ) => {
            if (!key) return '';

            if (params) {
                return Object.keys(params).reduce(
                    (acc, param) =>
                        acc.replace(
                            new RegExp(`{{${param}}}`, 'g'),
                            params[param] as string
                        ),
                    messages[key] || key
                );
            }

            return messages[key] || key;
        },
        [messages]
    );

    useEffect(() => {
        const localeCookie = getCookieValue('locale');

        if (!localeCookie) {
            setLocaleCookie(locale);
        }

        setMessages(locales[locale]);
    }, [locale]);

    const contextValue = useMemo(
        () => ({ locale, setLocale, messages, t }),
        [locale, setLocale, messages, t]
    );

    return (
        <LocaleContext.Provider value={contextValue}>
            {children}
        </LocaleContext.Provider>
    );
};
