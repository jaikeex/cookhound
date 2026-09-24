import React from 'react';
import { LoginTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/common/utils/seo';
import { RETURN_TARGET_PARAM } from '@/common/constants';

type LoginPageProps = Readonly<{
    searchParams: Promise<
        Readonly<Record<string, string | string[] | undefined>>
    >;
}>;

//|=============================================================================================|//

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const target = (await searchParams)[RETURN_TARGET_PARAM];

    return (
        <LoginTemplate
            callbackUrl={typeof target === 'string' ? target : undefined}
        />
    );
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.auth.login.title',
        descriptionKey: 'meta.auth.login.description',
        noindex: true
    });
}
