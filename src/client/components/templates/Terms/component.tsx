'use client';

import React from 'react';
import { Typography } from '@/client/components';
import {
    TERMS_CONTENT,
    TERMS_TIMESTAMP,
    TERMS_TITLE
} from '@/common/constants/terms';

export type TermsTemplateProps = NonNullable<unknown>;

export const TermsTemplate: React.FC<TermsTemplateProps> = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <Typography variant="heading-xl" className="mb-8">
                {TERMS_TITLE}
            </Typography>

            <Typography variant="body" className="mb-8">
                {TERMS_TIMESTAMP}
            </Typography>

            {TERMS_CONTENT.map((section, sectionIdx) => (
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
                                {paragraph.content}
                            </Typography>
                        </div>
                    ))}
                </section>
            ))}
        </div>
    );
};
