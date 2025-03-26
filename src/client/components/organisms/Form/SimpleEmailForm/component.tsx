'use client';

import React from 'react';
import { Submit, TextInput, Typography } from '@/client/components';
import { useFormStatus } from 'react-dom';
import { useLocale } from '@/client/store';
import type { I18nMessage } from '@/client/locales';

export type SimpleEmailFormErrors = {
    email?: I18nMessage;
    server?: I18nMessage;
};

export type SimpleEmailFormProps = Readonly<{
    disabled: boolean;
    errors: SimpleEmailFormErrors;
    submitLabel?: string;
}>;

export const SimpleEmailForm: React.FC<SimpleEmailFormProps> = ({
    disabled,
    errors,
    submitLabel
}) => {
    const { pending } = useFormStatus();
    const { t } = useLocale();

    return (
        <div className="base-form">
            <TextInput
                label={t('auth.form.email')}
                id="email"
                name="email"
                disabled={pending || disabled}
                error={t(errors?.email)}
            />

            <Submit
                className="min-w-40 !mt-10 mx-auto"
                disabled={disabled}
                pending={pending}
                label={submitLabel || t('app.general.submit')}
            />

            {errors?.server ? (
                <Typography variant={'error'} align={'center'}>
                    {t(errors.server)}
                </Typography>
            ) : null}
        </div>
    );
};
