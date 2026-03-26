'use client';

import React from 'react';
import { Typography } from '@/client/components';
import { useLocale } from '@/client/store/I18nContext';
import type { ClientUsageEntry } from '@/common/types';

export type ClientUsageSectionProps = Readonly<{
    clientUsage: readonly ClientUsageEntry[];
}>;

export const ClientUsageSection: React.FC<ClientUsageSectionProps> = ({
    clientUsage
}) => {
    const { t } = useLocale();

    return (
        <div>
            <Typography
                variant="body-xs"
                className="mb-1 font-medium uppercase tracking-wider text-gray-500"
            >
                {t('admin.apiDocs.endpoint.clientUsage')}
            </Typography>

            <div className="flex flex-col gap-1.5">
                {clientUsage.map((entry) => (
                    <div
                        key={entry.hook}
                        className="flex flex-col gap-0.5 rounded bg-gray-50 px-3 py-2 dark:bg-gray-800/50"
                    >
                        <div className="flex items-center gap-2">
                            <Typography
                                variant="body-xs"
                                className="shrink-0 font-medium text-gray-500"
                            >
                                {t('admin.apiDocs.endpoint.clientUsage.hook')}
                            </Typography>

                            <code className="font-mono text-xs text-primary-600 dark:text-primary-400">
                                {entry.hook}
                            </code>
                        </div>

                        <div className="flex items-center gap-2">
                            <Typography
                                variant="body-xs"
                                className="shrink-0 font-medium text-gray-500"
                            >
                                {t(
                                    'admin.apiDocs.endpoint.clientUsage.apiClient'
                                )}
                            </Typography>

                            <code className="font-mono text-xs text-gray-600 dark:text-gray-400">
                                {entry.apiClient}
                            </code>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
