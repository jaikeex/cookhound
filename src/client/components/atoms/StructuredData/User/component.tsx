import { StructuredData } from '@/client/components';
import { ENV_CONFIG_PUBLIC, ROUTES } from '@/common/constants';
import type { Locale, User } from '@/common/types';
import React from 'react';
import {
    generateBreadcrumbSchema,
    generatePersonSchema
} from '@/server/utils/seo';
import { tServer } from '@/server/utils/locales';

type UserStructuredDataProps = Readonly<{
    userPromise: Promise<User>;
    locale: Locale;
}>;

export const UserStructuredData: React.FC<UserStructuredDataProps> = async ({
    userPromise,
    locale
}) => {
    const user = await userPromise;
    const userSchema = generatePersonSchema(user, ENV_CONFIG_PUBLIC.ORIGIN);

    const breadcrumbSchema = generateBreadcrumbSchema([
        {
            name: tServer(locale, 'app.general.home'),
            url: ENV_CONFIG_PUBLIC.ORIGIN
        },
        {
            name: user.username,
            url: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.user.detail(user.id)}`
        }
    ]);

    return (
        <React.Fragment>
            <StructuredData schema={userSchema} id="user-jsonld" />
            <StructuredData schema={breadcrumbSchema} id="breadcrumb-jsonld" />
        </React.Fragment>
    );
};
