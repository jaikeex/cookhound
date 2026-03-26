'use client';

import React, { useCallback, useState } from 'react';
import { Typography, Chip } from '@/client/components';
import { useLocale } from '@/client/store/I18nContext';
import type { SerializedEndpointDoc } from '@/common/types';
import {
    METHOD_COLORS,
    AUTH_LABELS
} from '@/client/components/templates/Admin/ApiDocs/constants';
import { formatWindow } from '@/client/components/templates/Admin/ApiDocs/utils';
import { SchemaSection } from '@/client/components/templates/Admin/ApiDocs/SchemaSection';
import { ResponsesSection } from '@/client/components/templates/Admin/ApiDocs/ResponsesSection';
import { ClientUsageSection } from '@/client/components/templates/Admin/ApiDocs/ClientUsageSection';

export type EndpointCardProps = Readonly<{
    path: string;
    endpoint: SerializedEndpointDoc;
}>;

export const EndpointCard: React.FC<EndpointCardProps> = ({
    path,
    endpoint
}) => {
    const { t } = useLocale();
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = useCallback(() => {
        setExpanded((prev) => !prev);
    }, []);

    const hasDetails =
        endpoint.bodySchema ||
        endpoint.querySchema ||
        endpoint.paramsSchema ||
        (endpoint.clientUsage && endpoint.clientUsage.length > 0) ||
        Object.keys(endpoint.responses).length > 0;

    return (
        <div className="rounded-lg border border-gray-200 bg-sheet dark:border-gray-700">
            <button
                type="button"
                className="flex w-full items-start gap-3 p-4 text-left"
                onClick={hasDetails ? toggleExpanded : undefined}
            >
                <Chip
                    color={METHOD_COLORS[endpoint.method]}
                    size="xs"
                    className="mt-0.5 shrink-0"
                >
                    {endpoint.method}
                </Chip>

                <div className="min-w-0 flex-1">
                    <Typography
                        variant="body-sm"
                        className="font-mono font-medium"
                    >
                        {path}
                    </Typography>

                    <Typography
                        variant="body-xs"
                        className="mt-0.5 text-gray-500"
                    >
                        {endpoint.summary}
                    </Typography>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {endpoint.testOnly ? (
                        <Chip color="warning" size="xs" outlined>
                            Test
                        </Chip>
                    ) : null}

                    {endpoint.captchaRequired ? (
                        <Chip color="subtle" size="xs" outlined>
                            Captcha
                        </Chip>
                    ) : null}

                    {endpoint.auth !== 'public' ? (
                        <Chip color="subtle" size="xs">
                            {AUTH_LABELS[endpoint.auth]}
                        </Chip>
                    ) : null}

                    {endpoint.rateLimit ? (
                        <Chip color="subtle" size="xs" outlined>
                            {endpoint.rateLimit.maxRequests}/
                            {formatWindow(
                                endpoint.rateLimit.windowSizeInSeconds
                            )}
                        </Chip>
                    ) : null}

                    {hasDetails ? (
                        <svg
                            className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    ) : null}
                </div>
            </button>

            {expanded ? (
                <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                    {endpoint.description ? (
                        <Typography
                            variant="body-xs"
                            className="mb-3 text-gray-500"
                        >
                            {endpoint.description}
                        </Typography>
                    ) : null}

                    <div className="flex flex-col gap-3">
                        {endpoint.paramsSchema ? (
                            <SchemaSection
                                title={t('admin.apiDocs.endpoint.paramsSchema')}
                                schema={endpoint.paramsSchema}
                            />
                        ) : null}

                        {endpoint.querySchema ? (
                            <SchemaSection
                                title={t('admin.apiDocs.endpoint.querySchema')}
                                schema={endpoint.querySchema}
                            />
                        ) : null}

                        {endpoint.bodySchema ? (
                            <SchemaSection
                                title={`${t('admin.apiDocs.endpoint.bodySchema')}${endpoint.requestContentType ? ` (${endpoint.requestContentType})` : ''}`}
                                schema={endpoint.bodySchema}
                            />
                        ) : null}

                        <ResponsesSection responses={endpoint.responses} />

                        {endpoint.clientUsage &&
                        endpoint.clientUsage.length > 0 ? (
                            <ClientUsageSection
                                clientUsage={endpoint.clientUsage}
                            />
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
};
