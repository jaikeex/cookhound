'use client';

import React from 'react';
import Link from 'next/link';
import { Typography } from '@/client/components';
import { useLocale } from '@/client/store';

export type CaptchaDisclosureProps = Readonly<{
    className?: string;
}>;

/**
 * Shows the required reCAPTCHA branding disclosure text with links to Google's
 * Privacy Policy and Terms of Service. Must be shown whenever the recaptcha badge
 * is hidden per Google's ToS (shitty but not optional).
 */
export const CaptchaDisclosure: React.FC<CaptchaDisclosureProps> = ({
    className
}) => {
    const { t } = useLocale();

    return (
        <Typography
            variant="body-xs"
            align="center"
            className={`text-gray-400 dark:text-gray-500 ${className}`}
        >
            {t('app.captcha.disclosure.prefix')}{' '}
            <Link
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-600 dark:hover:text-gray-300"
            >
                {t('app.captcha.disclosure.privacy-policy')}
            </Link>{' '}
            {t('app.captcha.disclosure.and')}{' '}
            <Link
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-600 dark:hover:text-gray-300"
            >
                {t('app.captcha.disclosure.terms')}
            </Link>{' '}
            {t('app.captcha.disclosure.suffix')}
        </Typography>
    );
};
