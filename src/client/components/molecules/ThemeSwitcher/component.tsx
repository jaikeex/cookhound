'use client';

import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import type { IconButtonProps, SwitchProps } from '@/client/components';
import { IconButton, Switch } from '@/client/components';
import { useLocale } from '@/client/store';

type ThemeSwitcherIconProps = Omit<IconButtonProps, 'icon' | 'onClick'>;

export const ThemeSwitcherIcon: React.FC<ThemeSwitcherIconProps> = (props) => {
    const { t } = useLocale();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Ensure component is mounted before rendering theme-dependent content
    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }, [theme, setTheme]);

    /**
     * The following "memoization workaraound" is done because if the icon name is passed as a prop
     * to the Icon component dynamically it throws a hydration error...
     *
     * DO NOT DO THIS:
     *
     * <IconButton
     *     icon={theme === 'light' ? 'moon' : 'sun'}
     *     onClick={toggleTheme}
     *     className="text-gray-800 rounded dark:text-gray-200"
     *     {...props}
     * >
     */

    const iconProps = useMemo(
        () => ({
            onClick: toggleTheme,
            className: 'text-gray-800 rounded dark:text-gray-200',
            ...props
        }),
        [toggleTheme, props]
    );

    // Use resolvedTheme which is only available after hydration
    const currentTheme = mounted ? resolvedTheme || 'dark' : 'dark';

    const icon = useMemo(() => {
        switch (currentTheme) {
            case 'light':
                return (
                    <IconButton
                        icon="moon"
                        {...iconProps}
                        ariaLabel={t('app.general.dark-mode')}
                    />
                );
            case 'dark':
                return (
                    <IconButton
                        icon="sun"
                        {...iconProps}
                        ariaLabel={t('app.general.light-mode')}
                    />
                );
            default:
                return (
                    <IconButton
                        icon="sun"
                        {...iconProps}
                        ariaLabel={t('app.general.light-mode')}
                    />
                );
        }
    }, [currentTheme, iconProps, t]);

    return icon;
};

type ThemeSwitcherProps = Omit<
    SwitchProps,
    'labelRight' | 'labelLeft' | 'onChange' | 'checked'
>;

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = (props) => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { t } = useLocale();
    const [mounted, setMounted] = useState(false);

    // Ensure component is mounted before rendering theme-dependent content
    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }, [theme, setTheme]);

    // Use resolvedTheme which is only available after hydration
    const currentTheme = mounted ? resolvedTheme || 'dark' : 'dark';

    return (
        <Switch
            checked={currentTheme === 'dark'}
            labelLeft={t('app.general.dark-mode')}
            onChange={toggleTheme}
            {...props}
        />
    );
};
