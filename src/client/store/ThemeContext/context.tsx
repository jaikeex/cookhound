'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    memo,
    type PropsWithChildren
} from 'react';
import { THEME_STORAGE_KEY, THEMES } from '@/client/constants';

//~---------------------------------------------------------------------------------------------~//
//$                                            TYPES                                            $//
//~---------------------------------------------------------------------------------------------~//

interface ThemeContextType {
    theme: string;
    setTheme: (theme: string) => void;
    resolvedTheme: string;
    themes: string[];
}

//~---------------------------------------------------------------------------------------------~//
//$                                             HOOK                                            $//
//~---------------------------------------------------------------------------------------------~//

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
};

//~—————————————————————————————————————————————————————————————————————————————————————————————~//
//$                                        FOUC SCRIPT                                          $//
///
//# Reads the persisted theme from local storage and applies the relevant class before the
//# react content hydrates. Prevents flashes of unstyled content.
//#
//# Shamelessly copied from next-themes lib.
///
//~—————————————————————————————————————————————————————————————————————————————————————————————~//

type ThemeScriptProps = Readonly<{
    defaultTheme: string;
}>;

const ThemeScript: React.FC<ThemeScriptProps> = memo(({ defaultTheme }) => {
    const scriptContent = `(
    function()
        {
            try {
                var t=localStorage.getItem('${THEME_STORAGE_KEY}');
                if(!t||(t!=='light'&&t!=='dark')) t='${defaultTheme}';
                
                document.documentElement.classList.toggle('dark',t==='dark');
                document.documentElement.style.colorScheme=t
            } catch { 
                document.documentElement.classList.toggle('dark','${defaultTheme}'==='dark');
                document.documentElement.style.colorScheme='${defaultTheme}'
            }
        })()`;

    return (
        <script
            suppressHydrationWarning
            // intentional, no better way to do this really...
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: scriptContent }}
        />
    );
});

//~—————————————————————————————————————————————————————————————————————————————————————————————~//
//$                                      TRANSITION GUARD                                       $//
///
//# Disables all css transitions to prevent visual mismatches and artifacts during theme
//# switching. Returns a cleanup to enable them again.
//#
//# Shamelessly copied from next-themes lib.
///
//~—————————————————————————————————————————————————————————————————————————————————————————————~//

const disableTransitions = (): (() => void) => {
    const style = document.createElement('style');

    style.appendChild(
        document.createTextNode(
            '*,*::before,*::after{' +
                '-webkit-transition:none!important;' +
                '-moz-transition:none!important;' +
                '-o-transition:none!important;' +
                '-ms-transition:none!important;' +
                'transition:none!important' +
                '}'
        )
    );

    document.head.appendChild(style);

    return () => {
        //?—————————————————————————————————————————————————————————————————————————————————————?//
        //?                                   LAYOUT REFLOW                                     ?//
        ///
        //# Reading the style first before removing it forces something called "layout reflow"
        //# (also called "forced synchronous layout").
        //#
        //# Simply put (if I understand this correctly...), if the style tag is removed
        //# immediately, the browser may batch the dom mutations and never actually apply the
        //# transition freezing state from above. Reading the computed style forces the browser
        //# to flush all pending style changes and to compute the new computed style.
        //# This ensures that the browser is aware of the style change above and has applied it.
        ///
        //?—————————————————————————————————————————————————————————————————————————————————————?//

        window.getComputedStyle(document.body);

        setTimeout(() => {
            document.head.removeChild(style);
        }, 1);
    };
};

//~---------------------------------------------------------------------------------------------~//
//$                                          PROVIDER                                           $//
//~---------------------------------------------------------------------------------------------~//

type ThemeProviderProps = Readonly<{
    defaultTheme?: string;
}> &
    PropsWithChildren<NonNullable<unknown>>;

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
    defaultTheme = 'dark',
    children
}) => {
    const [theme, setThemeState] = useState<string>(() => {
        if (typeof window === 'undefined') return defaultTheme;

        try {
            const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

            if (stored && THEMES.includes(stored)) {
                return stored;
            }
        } catch {
            /**
             * no need to do anything here
             */
        }

        return defaultTheme;
    });

    const setTheme = useCallback((newTheme: string) => {
        const enableTransitions = disableTransitions();

        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        document.documentElement.style.colorScheme = newTheme;

        setThemeState(newTheme);

        enableTransitions();
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.style.colorScheme = theme;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = useMemo<ThemeContextType>(
        () => ({
            theme,
            setTheme,
            resolvedTheme: theme,
            themes: THEMES
        }),
        [theme, setTheme]
    );

    return (
        <ThemeContext.Provider value={value}>
            <ThemeScript defaultTheme={defaultTheme} />
            {children}
        </ThemeContext.Provider>
    );
};
