'use client';

import React from 'react';
import { PasswordInput } from '@/client/components/molecules/Form/PasswordInput';
import { Submit } from '@/client/components/molecules/Form/Submit';
import { Typography } from '@/client/components/atoms/Typography';
import type { I18nMessage } from '@/client/locales';
import { t } from '@/client/locales';
// import { useFormStatus } from 'react-dom';

export type ResetPasswordFormErrors = {
    password?: I18nMessage;
    repeatPassword?: I18nMessage;
    server?: I18nMessage;
};

export type ResetPasswordFormProps = Readonly<{
    disabled: boolean;
    errors: ResetPasswordFormErrors;
    pending?: boolean;
}>;

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
    disabled,
    errors,
    pending
}) => {
    // This hook call does nothing at the moment as it only works with react server actions.
    // It is left here for reference and to possibly inspire another solution in the future :D
    // const { pending } = useFormStatus();
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
                className="min-w-40 mt-10! mx-auto"
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
