'use client';

import React, { useCallback } from 'react';
import { ButtonBase, Divider, Typography } from '@/client/components';
import { useLocale, useModal } from '@/client/store';
import { DeleteAccountModal } from '@/client/components';

export type DangerZoneProps = Readonly<{
    className?: string;
}>;

export const DangerZone: React.FC<DangerZoneProps> = ({ className }) => {
    const { t } = useLocale();
    const { openModal } = useModal();

    const handleDeleteAccount = useCallback(
        () => openModal((close) => <DeleteAccountModal close={close} />),
        [openModal]
    );

    return (
        <div className={className}>
            <Typography variant="heading-sm" className="text-danger">
                {t('app.profile.settings.section-danger-zone')}
            </Typography>

            <Divider className="mt-1 border-danger/30" />

            <div className="mt-4 p-4 border border-danger/30 rounded-lg bg-danger/5 dark:bg-danger/10">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="grow">
                        <Typography
                            variant="body-md"
                            className="font-semibold text-danger"
                        >
                            {t('app.profile.settings.account-deactivation')}
                        </Typography>

                        <Typography variant="body-sm" className="mt-2">
                            {t(
                                'app.profile.settings.account-deactivation-description'
                            )}
                        </Typography>
                    </div>

                    <ButtonBase
                        onClick={handleDeleteAccount}
                        color="danger"
                        size="md"
                        className="md:shrink-0"
                    >
                        {t('app.profile.settings.account-deactivation-button')}
                    </ButtonBase>
                </div>
            </div>
        </div>
    );
};
