import { StructuredData } from '@/client/components/atoms/StructuredData/Generic';
import { ENV_CONFIG_PUBLIC, ROUTES } from '@/common/constants';
import type { User } from '@/common/types';
import React from 'react';
import {
    generateBreadcrumbSchema,
    generatePersonSchema
} from '@/server/utils/seo';
import { t } from '@/client/locales';

type UserStructuredDataProps = Readonly<{
    userPromise: Promise<User>;
}>;

export const UserStructuredData: React.FC<UserStructuredDataProps> = async ({
    userPromise
}) => {
    const user = await userPromise;
    const userSchema = generatePersonSchema(user, ENV_CONFIG_PUBLIC.ORIGIN);

    const breadcrumbSchema = generateBreadcrumbSchema([
        {
            name: t('app.general.home'),
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
