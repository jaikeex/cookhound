'use client';

import React from 'react';
import { Submit } from '@/client/components/molecules/Form/Submit';
import { TextInput } from '@/client/components/molecules/Form/TextInput';
import { Typography } from '@/client/components/atoms/Typography';
import type { I18nMessage } from '@/client/locales';
import { t } from '@/client/locales';
// import { useFormStatus } from 'react-dom';

export type SimpleEmailFormErrors = {
    email?: I18nMessage;
    server?: I18nMessage;
};

export type SimpleEmailFormProps = Readonly<{
    defaultEmail?: string | null;
    disabled: boolean;
    errors: SimpleEmailFormErrors;
    submitLabel?: string;
    pending?: boolean;
}>;

export const SimpleEmailForm: React.FC<SimpleEmailFormProps> = ({
    defaultEmail,
    disabled,
    errors,
    submitLabel,
    pending
}) => {
    // This hook call does nothing at the moment as it only works with react server actions.
    // It is left here for reference and to possibly inspire another solution in the future :D
    // const { pending } = useFormStatus();
    return (
        <div className="base-form">
            <TextInput
                label={t('auth.form.email')}
                id="email"
                name="email"
                defaultValue={defaultEmail ?? undefined}
                disabled={pending || disabled}
                error={t(errors?.email)}
            />

            <Submit
                className="min-w-40 mt-10! mx-auto"
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
