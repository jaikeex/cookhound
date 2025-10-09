'use client';

import React, { useCallback } from 'react';
import { Typography, ConsentSettingsModal } from '@/client/components';
import {
    PRIVACY_CONTENT,
    PRIVACY_TIMESTAMP,
    PRIVACY_TITLE
} from '@/common/constants/privacy';
import { parseContentLinks } from '@/client/utils';
import { useModal } from '@/client/store';

export type PrivacyTemplateProps = NonNullable<unknown>;

export const PrivacyTemplate: React.FC<PrivacyTemplateProps> = () => {
    const { openModal } = useModal();

    const handleCookieSettings = useCallback(() => {
        openModal((close) => <ConsentSettingsModal onClose={close} />, {
            hideCloseButton: true
        });
    }, [openModal]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 whitespace-pre-line">
            <Typography variant="heading-xl" className="mb-8">
                {PRIVACY_TITLE}
            </Typography>

            <Typography variant="body" className="mb-8">
                {PRIVACY_TIMESTAMP}
            </Typography>

            {PRIVACY_CONTENT.map((section, sectionIdx) => (
                <section key={`section-${sectionIdx}`} className="mb-8">
                    {section.title ? (
                        <Typography variant="heading-sm" className="mb-4">
                            {section.title}
                        </Typography>
                    ) : null}

                    {section.content.map((paragraph, paragraphIdx) => (
                        <div
                            key={`section-${sectionIdx}-paragraph-${paragraphIdx}`}
                            className="mb-4"
                        >
                            {paragraph.title ? (
                                <Typography
                                    variant="body-md"
                                    className="mb-0.5 font-semibold"
                                >
                                    {paragraph.title}
                                </Typography>
                            ) : null}

                            <Typography variant="body">
                                {parseContentLinks(paragraph.content, {
                                    onModalClick: handleCookieSettings
                                })}
                            </Typography>
                        </div>
                    ))}
                </section>
            ))}
        </div>
    );
};
