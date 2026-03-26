'use client';

import React from 'react';
import { Typography } from '@/client/components';
import { useLocale } from '@/client/store/I18nContext';
import type { SerializedResponseDoc } from '@/common/types';
import { SchemaSection } from '@/client/components/templates/Admin/ApiDocs/SchemaSection';
import { getStatusColor } from '@/client/components/templates/Admin/ApiDocs/utils';

export type ResponsesSectionProps = Readonly<{
    responses: Record<number, SerializedResponseDoc>;
}>;

export const ResponsesSection: React.FC<ResponsesSectionProps> = ({
    responses
}) => {
    const { t } = useLocale();
    const entries = Object.entries(responses);

    if (entries.length === 0) {
        return null;
    }

    return (
        <div>
            <Typography
                variant="body-xs"
                className="mb-1 font-medium uppercase tracking-wider text-gray-500"
            >
                {t('admin.apiDocs.endpoint.responses')}
            </Typography>

            <div className="flex flex-col gap-2">
                {entries.map(([status, doc]) => (
                    <div key={status} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-block min-w-12 rounded px-1.5 py-0.5 text-center text-xs font-mono font-medium ${getStatusColor(Number(status))}`}
                            >
                                {status}
                            </span>

                            <Typography
                                variant="body-xs"
                                className="text-gray-500"
                            >
                                {doc.description}
                            </Typography>
                        </div>

                        {doc.schema ? (
                            <div className="ml-14">
                                <SchemaSection
                                    title={t(
                                        'admin.apiDocs.endpoint.responseSchema'
                                    )}
                                    schema={doc.schema}
                                    variant="response"
                                />
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
};
