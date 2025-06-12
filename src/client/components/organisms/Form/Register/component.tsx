'use client';

import React from 'react';
import {
    PasswordInput,
    Submit,
    TextInput,
    Typography
} from '@/client/components';
import { useLocale } from '@/client/store';
import type { I18nMessage } from '@/client/locales';
// import { useFormStatus } from 'react-dom';

export type RegisterFormErrors = {
    email?: I18nMessage;
    password?: I18nMessage;
    repeatPassword?: I18nMessage;
    server?: I18nMessage;
    username?: I18nMessage;
};

export type RegisterFormProps = Readonly<{
    errors: RegisterFormErrors;
    pending?: boolean;
}>;

export const RegisterForm: React.FC<RegisterFormProps> = ({
    errors,
    pending
}) => {
    // This hook call does nothing at the moment as it only works with react server actions.
    // It is left here for reference and to possibly inspire another solution in the future :D
    // const { pending } = useFormStatus();

    const { t } = useLocale();

    return (
        <div className="base-form">
            <TextInput
                label={t('auth.form.username')}
                id="username"
                name="username"
                disabled={pending}
                error={t(errors?.username)}
            />
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
            <PasswordInput
                label={t('auth.form.repeat-password')}
                id="repeat-password"
                name="repeat-password"
                disabled={pending}
                error={t(errors?.repeatPassword)}
            />

            <Submit
                className="min-w-40 !mt-6 mx-auto"
                disabled={pending}
                pending={pending}
                label={t('auth.form.register')}
            />

            {errors?.server ? (
                <Typography variant={'error'} align={'center'}>
                    {t(errors.server)}
                </Typography>
            ) : null}
        </div>
    );
};
