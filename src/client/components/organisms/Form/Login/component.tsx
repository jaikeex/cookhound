'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import {
    FormCheckbox,
    PasswordInput,
    Submit,
    TextInput,
    Typography
} from '@/client/components';
import { useLocale } from '@/client/store';
import type { I18nMessage } from '@/client/locales';

export type LoginFormErrors = {
    email?: I18nMessage;
    password?: I18nMessage;
    keepLoggedIn?: I18nMessage;
    server?: I18nMessage;
};

export type LoginFormProps = Readonly<{
    errors?: LoginFormErrors;
}>;

export const LoginForm: React.FC<LoginFormProps> = ({ errors }) => {
    const { pending } = useFormStatus();
    const { t } = useLocale();

    return (
        <div className="base-form">
            <TextInput
                label={t('auth.form.email')}
                id="email"
                name="email"
                disabled={pending}
                error={t(errors?.email)}
            />
            <PasswordInput
                label={t('auth.form.password')}
                id="password"
                name="password"
                disabled={pending}
                error={t(errors?.password)}
            />
            <FormCheckbox
                label={t('auth.form.keep-logged-in')}
                id="keep-logged-in"
                name="keep-logged-in"
                disabled={pending}
            />

            <Submit
                className="min-w-40 !mt-6 mx-auto"
                pending={pending}
                label={t('auth.form.login')}
            />

            {errors?.server ? (
                <Typography variant={'error'} align={'center'}>
                    {t(errors.server)}
                </Typography>
            ) : null}
        </div>
    );
};
