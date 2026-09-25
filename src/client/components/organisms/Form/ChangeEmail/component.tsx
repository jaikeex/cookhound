import React from 'react';
import { ErrorList } from '@/client/components/molecules/Form/ErrorList';
import { PasswordInput } from '@/client/components/molecules/Form/PasswordInput';
import { Submit } from '@/client/components/molecules/Form/Submit';
import { TextInput } from '@/client/components/molecules/Form/TextInput';
import { Typography } from '@/client/components/atoms/Typography';
import type { I18nMessage } from '@/client/locales';
import { t } from '@/client/locales';

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
    const errorsToDisplay = Object.entries(errors)
        .filter(([field]) => field !== 'server')
        .map(([, error]) => t(error));

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
                className="min-w-40 mt-6! mx-auto"
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
