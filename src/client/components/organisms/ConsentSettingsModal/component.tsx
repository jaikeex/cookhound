'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Typography, ConsentRow, ButtonBase } from '@/client/components';
import { useConsent, useLocale } from '@/client/store';
import type { ConsentCategory } from '@/common/types/cookie-consent';

type ConsentSettingsModalProps = Readonly<{
    onClose: () => void;
}>;

export const ConsentSettingsModal: React.FC<ConsentSettingsModalProps> = ({
    onClose
}) => {
    //~-----------------------------------------------------------------------------------------~//
    //$                                          STATE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    const { t, locale } = useLocale();
    const { consent, updateConsent } = useConsent();

    const [preferences, setPreferences] = useState<boolean>(
        consent?.accepted.includes('preferences') ?? false
    );
    const [analytics, setAnalytics] = useState<boolean>(
        consent?.accepted.includes('analytics') ?? false
    );
    const [marketing, setMarketing] = useState<boolean>(
        consent?.accepted.includes('marketing') ?? false
    );

    //~—————————————————————————————————————————————————————————————————————————————————————————~//
    //$                               SYNC WITH GLOBAL CONSENT                                  $//
    ///
    //# Keep local switch states in sync whenever the global consent object changes. This guarantees
    //# that the modal always shows the most recent preferences, even if they were modified in
    //# another tab or by a background process.
    ///
    //~—————————————————————————————————————————————————————————————————————————————————————————~//

    useEffect(() => {
        setPreferences(consent?.accepted.includes('preferences') ?? false);
        setAnalytics(consent?.accepted.includes('analytics') ?? false);
        setMarketing(consent?.accepted.includes('marketing') ?? false);
    }, [consent]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                        HANDLERS                                         $//
    //~-----------------------------------------------------------------------------------------~//

    const handlePreferences = useCallback<
        React.ChangeEventHandler<HTMLInputElement>
    >((e) => {
        setPreferences(e.target.checked);
    }, []);

    const handleAnalytics = useCallback<
        React.ChangeEventHandler<HTMLInputElement>
    >((e) => {
        setAnalytics(e.target.checked);
    }, []);

    const handleMarketing = useCallback<
        React.ChangeEventHandler<HTMLInputElement>
    >((e) => {
        setMarketing(e.target.checked);
    }, []);

    const handleSave = useCallback(() => {
        const accepted: Array<ConsentCategory> = ['essential'];
        if (preferences) accepted.push('preferences');
        if (analytics) accepted.push('analytics');
        if (marketing) accepted.push('marketing');

        const consent = preferences || analytics || marketing;

        updateConsent(accepted, consent);
        onClose();
    }, [preferences, analytics, marketing, updateConsent, onClose]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                   STATUS STRING                                         $//
    //~-----------------------------------------------------------------------------------------~//

    const getCategoryStatusString = useMemo(() => {
        return (category: ConsentCategory): string => {
            if (!consent?.createdAt) return '';

            if (category === 'essential') {
                return t('app.cookies.status.allways-enabled');
            }

            const createdMs =
                typeof consent.createdAt === 'string'
                    ? new Date(consent.createdAt).getTime()
                    : consent.createdAt.getTime();

            const createdAt = new Date(createdMs);

            const translationKey = consent.accepted.includes(category)
                ? 'app.cookies.status.accepted'
                : 'app.cookies.status.declined';

            return t(translationKey, {
                date: `${createdAt.toLocaleDateString(locale)} ${createdAt.toLocaleTimeString(locale)}`
            });
        };
    }, [consent, locale, t]);

    return (
        <div className="flex flex-col gap-6 w-[90vw] max-w-lg">
            <Typography as="h6" variant="heading-md" align="center">
                {t('app.cookies.modal.title')}
            </Typography>

            <Typography variant="body-sm" align="center">
                {t('app.cookies.modal.description')}
            </Typography>

            <div className="flex flex-col gap-4 mt-2">
                <ConsentRow
                    allwaysOn={true}
                    description={t('app.cookies.modal.essential-description')}
                    status={getCategoryStatusString('essential')}
                    title={t('app.cookies.modal.essential')}
                />

                <ConsentRow
                    allwaysOn={false}
                    checked={preferences}
                    description={t('app.cookies.modal.preferences-description')}
                    onChange={handlePreferences}
                    status={getCategoryStatusString('preferences')}
                    title={t('app.cookies.modal.preferences')}
                />

                <ConsentRow
                    allwaysOn={false}
                    checked={analytics}
                    description={t('app.cookies.modal.analytics-description')}
                    onChange={handleAnalytics}
                    status={getCategoryStatusString('analytics')}
                    title={t('app.cookies.modal.analytics')}
                />

                <ConsentRow
                    allwaysOn={false}
                    checked={marketing}
                    description={t('app.cookies.modal.marketing-description')}
                    onChange={handleMarketing}
                    status={getCategoryStatusString('marketing')}
                    title={t('app.cookies.modal.marketing')}
                />
            </div>

            <div className="flex gap-2">
                <ButtonBase
                    className="w-full"
                    color="subtle"
                    onClick={onClose}
                    outlined
                    size="md"
                >
                    {t('app.general.cancel')}
                </ButtonBase>

                <ButtonBase
                    className="w-full"
                    color="primary"
                    onClick={handleSave}
                    size="md"
                >
                    {t('app.general.save')}
                </ButtonBase>
            </div>
        </div>
    );
};
