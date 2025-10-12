'use client';

import React from 'react';
import {
    ErrorList,
    FormCheckbox,
    PasswordInput,
    Submit,
    TextInput,
    Typography
} from '@/client/components';
import { useLocale } from '@/client/store';
import type { I18nMessage } from '@/client/locales';
// import { useFormStatus } from 'react-dom';

export type LoginFormErrors = {
    email?: I18nMessage;
    keepLoggedIn?: I18nMessage;
    password?: I18nMessage;
    server?: I18nMessage;
};

export type LoginFormProps = Readonly<{
    errors: LoginFormErrors;
    pending?: boolean;
}>;

export const LoginForm: React.FC<LoginFormProps> = ({ errors, pending }) => {
    // This hook call does nothing at the moment as it only works with react server actions.
    // It is left here for reference and to possibly inspire another solution in the future :D
    // const { pending } = useFormStatus();

    const { t } = useLocale();

    const errorsToDisplay = Object.values(errors).map((error) => t(error));

    return (
        <div className="base-form">
            <TextInput
                disabled={pending}
                id="email"
                label={t('auth.form.email')}
                name="email"
                data-testid="login-email"
            />

            <PasswordInput
                disabled={pending}
                id="password"
                label={t('auth.form.password')}
                name="password"
                data-testid="login-password"
            />

            <FormCheckbox
                disabled={pending}
                id="keep-logged-in"
                label={t('auth.form.keep-logged-in')}
                name="keep-logged-in"
                data-testid="login-keep-logged-in"
            />

            <ErrorList className="self-start" errors={errorsToDisplay} />

            <Submit
                className="min-w-40 !mt-6 mx-auto"
                label={t('auth.form.login')}
                pending={pending}
                data-testid="login-submit"
            />

            {errors?.server ? (
                <Typography align={'center'} variant={'error'}>
                    {t(errors.server)}
                </Typography>
            ) : null}
        </div>
    );
};
