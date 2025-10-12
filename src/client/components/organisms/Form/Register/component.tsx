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
import Link from 'next/link';
// import { useFormStatus } from 'react-dom';

export type RegisterFormErrors = {
    email?: I18nMessage;
    password?: I18nMessage;
    repeatPassword?: I18nMessage;
    termsAccepted?: I18nMessage;
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

    const errorsToDisplay = Object.values(errors).map((error) => t(error));

    const termsLabel = (
        <>
            {t('auth.form.accept-terms')}{' '}
            <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
            >
                {t('auth.form.terms-of-use')}
            </Link>{' '}
            {t('auth.form.and')}{' '}
            <Link href="/privacy" target="_blank" rel="noopener noreferrer">
                {t('auth.form.privacy-policy')}
            </Link>
        </>
    );

    return (
        <div className="base-form">
            <TextInput
                disabled={pending}
                id="username"
                label={t('auth.form.username')}
                name="username"
                data-testid="register-username"
            />

            <TextInput
                disabled={pending}
                id="email"
                label={t('auth.form.email')}
                name="email"
                data-testid="register-email"
            />

            <PasswordInput
                disabled={pending}
                id="password"
                label={t('auth.form.password')}
                name="password"
                data-testid="register-password"
            />

            <PasswordInput
                disabled={pending}
                id="repeat-password"
                label={t('auth.form.repeat-password')}
                name="repeat-password"
                data-testid="register-repeat-password"
            />

            <FormCheckbox
                className="mt-2 w-full"
                disabled={pending}
                id="terms-accepted"
                name="terms-accepted"
                label={termsLabel}
                data-testid="register-terms"
            />

            <ErrorList className="self-start" errors={errorsToDisplay} />

            <Submit
                className="min-w-40 !mt-6 mx-auto"
                disabled={pending}
                label={t('auth.form.register')}
                pending={pending}
                data-testid="register-submit"
            />

            {errors?.server ? (
                <Typography align={'center'} variant={'error'}>
                    {t(errors.server)}
                </Typography>
            ) : null}
        </div>
    );
};
