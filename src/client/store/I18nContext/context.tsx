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

type LocaleContextType = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    messages: Record<string, string>;
    t: (
        key: I18nMessage | undefined,
        params?: Record<string, string | number | boolean>,
        fallback?: string
    ) => string;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

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
            params?: Record<string, string | number | boolean>,
            fallback?: string
        ) => {
            if (!key) return '';

            if (messages[key] && params) {
                return Object.keys(params).reduce(
                    (acc, param) =>
                        acc.replace(
                            new RegExp(`{{${param}}}`, 'g'),
                            params[param] as string
                        ),
                    messages[key] || key
                );
            }

            if (messages[key]) {
                return messages[key];
            }

            if (fallback) {
                return messages[fallback as keyof Messages] || fallback;
            }

            return key;
        },
        [messages]
    );

    useEffect(() => {
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
