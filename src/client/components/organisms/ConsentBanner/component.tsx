'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { ButtonBase, Typography } from '@/client/components';
import { classNames } from '@/client/utils';
import { useConsent } from '@/client/store';
import { useModal } from '@/client/store';
import { useLocale } from '@/client/store';
import { ConsentSettingsModal } from '@/client/components';

export const ConsentBanner: React.FC = () => {
    const { consent, acceptAll, rejectAll } = useConsent();
    const { openModal } = useModal();
    const { t } = useLocale();

    //?—————————————————————————————————————————————————————————————————————————————————————————?//
    //?                                        SEO FAIL                                         ?//
    ///
    //# This is important from SEO perspective. Crawlers have no consent when they visit,
    //# and for some reason (not sure exactly why) the server-side rendered banner gets picked up
    //# as the most prominent text on the page, ignoring the meta description.
    //#
    //# The data-nosnippet prop passed to the wrapper div should have the same effect, but just
    //# to be sure, the hydration check was added...
    ///
    //?—————————————————————————————————————————————————————————————————————————————————————————?//

    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const handleManage = useCallback(() => {
        openModal((close) => <ConsentSettingsModal onClose={close} />, {
            hideCloseButton: true
        });
    }, [openModal]);

    if (!isHydrated || consent) return null;

    return (
        <div
            data-nosnippet
            className={classNames(
                'fixed bottom-0 left-0 z-[999] w-full p-4 md:p-6 flex flex-col md:flex-row items-center gap-4',
                'bg-teal-50 dark:bg-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.15)]'
            )}
        >
            <Typography
                variant="body-sm"
                className="flex-1 text-center md:text-left"
            >
                {t('app.cookies.banner.title')}
            </Typography>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <ButtonBase size="sm" color="danger" onClick={rejectAll}>
                    {t('app.cookies.banner.reject-all')}
                </ButtonBase>
                <ButtonBase size="sm" color="primary" onClick={acceptAll}>
                    {t('app.cookies.banner.accept-all')}
                </ButtonBase>
                <ButtonBase
                    size="sm"
                    color="subtle"
                    outlined
                    onClick={handleManage}
                >
                    {t('app.cookies.banner.manage-preferences')}
                </ButtonBase>
            </div>
        </div>
    );
};
