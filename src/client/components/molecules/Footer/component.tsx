'use client';

import { classNames } from '@/client/utils';
import React, { useCallback } from 'react';
import { useModal } from '@/client/store';
import { ConsentSettingsModal } from '@/client/components';
import Link from 'next/link';
import { ROUTES, VERSION } from '@/common/constants';
import { t } from '@/client/locales';

type FooterProps = Readonly<{
    className?: string;
}>;

export const Footer: React.FC<FooterProps> = ({ className }) => {
    const { openModal } = useModal();

    const handleCookieSettings = useCallback(() => {
        openModal((close) => <ConsentSettingsModal onClose={close} />, {
            hideCloseButton: true
        });
    }, [openModal]);

    const currentYear = new Date().getFullYear();

    return (
        <footer className={classNames('py-6 px-4 pb-20 md:pb-6', className)}>
            <div className="flex items-center justify-center flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 max-w-7xl mx-auto">
                <button
                    onClick={handleCookieSettings}
                    className="text-sm text-gray-800 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors underline"
                >
                    {t('app.footer.cookie-settings')}
                </button>

                <Link
                    href={ROUTES.terms}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-800 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors underline"
                >
                    {t('app.footer.terms-of-use')}
                </Link>

                <Link
                    href={ROUTES.privacy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-800 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors underline"
                >
                    {t('app.footer.privacy-policy')}
                </Link>

                <Link
                    href={ROUTES.contact}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-800 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors underline"
                >
                    {t('app.footer.contact')}
                </Link>

                <span className="text-sm text-gray-800 dark:text-gray-400">
                    {t('app.footer.copyright', {
                        year: currentYear,
                        version: VERSION
                    })}
                </span>
            </div>
        </footer>
    );
};
