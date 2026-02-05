'use client';

import React from 'react';
import {
    ErrorList,
    Submit,
    Textarea,
    TextInput,
    Typography
} from '@/client/components';
import { useLocale } from '@/client/store';
import type { I18nMessage } from '@/client/locales';

export type ContactFormErrors = {
    name?: I18nMessage;
    email?: I18nMessage;
    subject?: I18nMessage;
    message?: I18nMessage;
    server?: I18nMessage;
};

export type ContactFormProps = Readonly<{
    errors: ContactFormErrors;
    pending?: boolean;
}>;

export const ContactForm: React.FC<ContactFormProps> = ({
    errors,
    pending
}) => {
    const { t } = useLocale();

    const errorsToDisplay = Object.values(errors).map((error) => t(error));

    return (
        <div className="base-form">
            <TextInput
                disabled={pending}
                id="name"
                label={t('contact.form.name')}
                name="name"
            />

            <TextInput
                disabled={pending}
                id="email"
                label={t('contact.form.email')}
                name="email"
            />

            <TextInput
                disabled={pending}
                id="subject"
                label={t('contact.form.subject')}
                name="subject"
            />

            <Textarea
                disabled={pending}
                id="message"
                label={t('contact.form.message')}
                name="message"
                rows={6}
            />

            <ErrorList className="self-start" errors={errorsToDisplay} />

            <Submit
                className="min-w-40 mt-6! mx-auto"
                label={t('contact.form.submit')}
                pending={pending}
            />

            {errors?.server ? (
                <Typography align={'center'} variant={'error'}>
                    {t(errors.server)}
                </Typography>
            ) : null}
        </div>
    );
};
