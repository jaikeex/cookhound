'use client';

import React from 'react';
import { PasswordInput, Submit, Typography } from '@/client/components';
import { useFormStatus } from 'react-dom';
import { useLocale } from '@/client/store';
import type { I18nMessage } from '@/client/locales';

export type ResetPasswordFormErrors = {
    password?: I18nMessage;
    repeatPassword?: I18nMessage;
    server?: I18nMessage;
};

export type ResetPasswordFormProps = Readonly<{
    disabled: boolean;
    errors: ResetPasswordFormErrors;
}>;

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
    disabled,
    errors
}) => {
    const { pending } = useFormStatus();
    const { t } = useLocale();

    return (
        <div className="base-form">
            <PasswordInput
                label={t('auth.form.password')}
                id="password"
                name="password"
                disabled={pending}
                error={t(errors?.password)}
            />
            <PasswordInput
                label={t('auth.form.repeat-password')}
                id="repeat-password"
                name="repeat-password"
                disabled={pending}
                error={t(errors?.repeatPassword)}
            />

            <Submit
                className="min-w-40 !mt-10 mx-auto"
                disabled={disabled}
                pending={pending}
                label={t('app.general.submit')}
            />

            {errors?.server ? (
                <Typography variant={'error'} align={'center'}>
                    {t(errors.server)}
                </Typography>
            ) : null}
        </div>
    );
};
