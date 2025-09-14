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
    password?: I18nMessage;
    keepLoggedIn?: I18nMessage;
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
                label={t('auth.form.email')}
                id="email"
                name="email"
                disabled={pending}
            />

            <PasswordInput
                label={t('auth.form.password')}
                id="password"
                name="password"
                disabled={pending}
            />

            <FormCheckbox
                label={t('auth.form.keep-logged-in')}
                id="keep-logged-in"
                name="keep-logged-in"
                disabled={pending}
            />

            <ErrorList errors={errorsToDisplay} className="self-start" />

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
