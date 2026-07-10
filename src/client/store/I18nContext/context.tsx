'use client';

import React, {
    createContext,
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import type { I18nMessage, Locale, Messages } from '@/client/locales';
import { locales } from '@/client/locales';
import { getCookie } from '@/client/utils';
import { isSupportedLocale } from '@/common/utils/locale';
import { LOCALE_COOKIE_NAME } from '@/common/constants';

type LocaleContextType = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    localeResolved: boolean;
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
    const [localeResolved, setLocaleResolved] = useState(false);

    const messages = useMemo<Messages>(
        () => locales[locale] ?? defaultMessages,
        [locale, defaultMessages]
    );

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

    //~————————————————————————————————————————————————————————————————————————————————————————~//
    //$                                   INITIAL RESOLUTION                                    $//
    ///
    //# The root layout is statically rendered, so it cannot seed the provider with the
    //# visitor's locale (that would require reading the request cookie and break ISR). Instead
    //# resolve it here, once, on the client from the functional locale cookie. Until this
    //# runs, localeResolved stays false and locale-dependent chrome renders a skeleton.
    ///
    //~————————————————————————————————————————————————————————————————————————————————————————~//

    useEffect(() => {
        const cookieLocale = getCookie(LOCALE_COOKIE_NAME);

        if (cookieLocale && isSupportedLocale(cookieLocale)) {
            setLocale((current) =>
                current === cookieLocale ? current : cookieLocale
            );
        }

        setLocaleResolved(true);
    }, []);

    const contextValue = useMemo(
        () => ({ locale, setLocale, localeResolved, messages, t }),
        [locale, setLocale, localeResolved, messages, t]
    );

    return (
        <LocaleContext.Provider value={contextValue}>
            <LocaleScript />
            {children}
        </LocaleContext.Provider>
    );
};

//~—————————————————————————————————————————————————————————————————————————————————————————————~//
//$                                       LOCALE SCRIPT                                         $//
///
//# Mirrors the theme FOUC script: an inline, blocking script that reads the locale cookie and
//# sets <html lang> before first paint. The static HTML ships lang=DEFAULT_LOCALE; this corrects
//# it for returning visitors whose cookie says otherwise, before the React tree hydrates.
///
//~—————————————————————————————————————————————————————————————————————————————————————————————~//

const LocaleScript: React.FC = memo(() => {
    const scriptContent = `(
    function() {
        try {
            var m = document.cookie.match(/(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)/);
            var l = m ? decodeURIComponent(m[1]) : null;
            if (l === 'en' || l === 'cs') document.documentElement.lang = l;
        } catch {}
    })()`;

    return (
        <script
            suppressHydrationWarning
            // intentional inline script to avoid a flash of the wrong lang attribute
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: scriptContent }}
        />
    );
});

LocaleScript.displayName = 'LocaleScript';
