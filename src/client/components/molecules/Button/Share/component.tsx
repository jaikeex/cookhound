'use client';

import React from 'react';
import { Icon, Typography } from '@/client/components';
import { type SocialPlatform, SOCIAL_PLATFORMS } from '@/client/constants';
import { classNames } from '@/client/utils';
import { useLocale } from '@/client/store';

//~---------------------------------------------------------------------------------------------~//
//$                                            TYPES                                            $//
//~---------------------------------------------------------------------------------------------~//

export type ShareButtonProps = Readonly<{
    platform: SocialPlatform;
    onClick: () => void;
    disabled?: boolean;
}>;

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

/**
 * Button for sharing content on a specific social media platform
 *
 * @param props - ShareButtonProps
 */
export const ShareButton: React.FC<ShareButtonProps> = ({
    platform,
    onClick,
    disabled = false
}) => {
    const { t } = useLocale();
    const config = SOCIAL_PLATFORMS[platform];

    const color = disabled
        ? 'text-gray-400 dark:text-gray-500'
        : config.className;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={classNames(
                'flex flex-col items-center justify-center gap-2 p-4',
                'rounded-lg border-2 transition-all duration-200',
                disabled
                    ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
            )}
        >
            <Icon
                name={config.icon}
                size={32}
                className={classNames('transition-colors', color)}
            />

            <Typography
                variant="body-sm"
                className={classNames('text-center font-medium')}
            >
                {t(`app.share.${platform}`)}
            </Typography>
        </button>
    );
};
