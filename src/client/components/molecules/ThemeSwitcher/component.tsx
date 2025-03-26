'use client';

import React, { useCallback } from 'react';
import { useTheme } from 'next-themes';
import type { IconButtonProps, SwitchProps } from '@/client/components';
import { IconButton, Switch } from '@/client/components';
import { useLocale } from '@/client/store';

type ThemeSwitcherIconProps = Omit<IconButtonProps, 'icon' | 'onClick'>;

export const ThemeSwitcherIcon: React.FC<ThemeSwitcherIconProps> = (props) => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }, [theme, setTheme]);

    return (
        <IconButton
            icon={theme === 'light' ? 'moon' : 'sun'}
            onClick={toggleTheme}
            className="text-gray-800 rounded dark:text-gray-200"
            {...props}
        />
    );
};

type ThemeSwitcherProps = Omit<
    SwitchProps,
    'labelRight' | 'labelLeft' | 'onChange' | 'checked'
>;

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = (props) => {
    const { theme, setTheme } = useTheme();
    const { t } = useLocale();

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }, [theme, setTheme]);

    return (
        <Switch
            checked={theme === 'dark'}
            labelLeft={t('app.general.dark-mode')}
            onChange={toggleTheme}
            {...props}
        />
    );
};
