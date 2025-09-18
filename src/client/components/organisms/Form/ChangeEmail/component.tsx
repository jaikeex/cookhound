'use client';

import React from 'react';
import {
    ErrorList,
    PasswordInput,
    Submit,
    TextInput,
    Typography
} from '@/client/components';
import { useLocale } from '@/client/store';
import type { I18nMessage } from '@/client/locales';

export type ChangeEmailFormErrors = {
    newEmail?: I18nMessage;
    password?: I18nMessage;
    server?: I18nMessage;
};

export type ChangeEmailFormProps = Readonly<{
    errors: ChangeEmailFormErrors;
    pending?: boolean;
}>;

export const ChangeEmailForm: React.FC<ChangeEmailFormProps> = ({
    errors,
    pending
}) => {
    const { t } = useLocale();

    const errorsToDisplay = Object.values(errors).map((error) => t(error));

    return (
        <div className="base-form">
            <TextInput
                label={t('auth.form.new-email')}
                id="newEmail"
                name="newEmail"
                disabled={pending}
                error={t(errors?.newEmail)}
            />

            <PasswordInput
                label={t('auth.form.current-password')}
                id="password"
                name="password"
                disabled={pending}
                error={t(errors?.password)}
            />

            <ErrorList errors={errorsToDisplay} className="self-start" />

            <Submit
                className="min-w-40 !mt-6 mx-auto"
                pending={pending}
                label={t('auth.form.change-email-send-button')}
            />

            {errors?.server ? (
                <Typography variant={'error'} align={'center'}>
                    {t(errors.server)}
                </Typography>
            ) : null}
        </div>
    );
};
