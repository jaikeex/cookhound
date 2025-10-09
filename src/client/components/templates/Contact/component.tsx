'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { ContactFormErrors } from '@/client/components';
import { ContactForm, Typography } from '@/client/components';
import type { ContactFormData } from '@/common/types';
import { z } from 'zod';
import { validateFormData } from '@/client/utils/form';
import { useLocale, useSnackbar } from '@/client/store';
import type { I18nMessage } from '@/client/locales';
import { chqc } from '@/client/request/queryClient';

//~---------------------------------------------------------------------------------------------~//
//$                                          VALIDATION                                         $//
//~---------------------------------------------------------------------------------------------~//

export const contactSchema = z.object({
    name: z.string().trim().min(1, 'contact.error.name-required').max(100),
    email: z
        .email('contact.error.email-invalid')
        .min(1, 'contact.error.email-required'),
    subject: z
        .string()
        .trim()
        .min(1, 'contact.error.subject-required')
        .max(200),
    message: z
        .string()
        .trim()
        .min(1, 'contact.error.message-required')
        .max(2000, 'contact.error.message-max-length')
});

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export type ContactTemplateProps = NonNullable<unknown>;

export const ContactTemplate: React.FC<ContactTemplateProps> = () => {
    const { alert } = useSnackbar();
    const { t } = useLocale();

    const formRef = React.useRef<HTMLFormElement>(null);

    const [formErrors, setFormErrors] = useState<ContactFormErrors>({});

    const {
        mutate: submitContact,
        isPending,
        error: submitError
    } = chqc.contact.useSubmitContactForm({
        onSuccess: () => {
            alert({
                message: t('contact.success.sent'),
                variant: 'success'
            });
            formRef.current?.reset();
            setFormErrors({});
        }
    });

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const formElement = event.currentTarget;
            const data = new FormData(formElement);
            let formData: ContactFormData;

            try {
                formData = extractFormData(data);
                const validationErrors: ContactFormErrors =
                    await validateFormData(formData, contactSchema);

                if (Object.keys(validationErrors).length > 0) {
                    setFormErrors(validationErrors);
                    return;
                }
            } catch (error: unknown) {
                setFormErrors({ server: 'contact.error.send-failed' });
                return;
            }

            setFormErrors({});
            submitContact(formData);
        },
        [submitContact]
    );

    useEffect(() => {
        if (submitError) {
            setFormErrors({ server: submitError.message as I18nMessage });
        }
    }, [submitError]);

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6 px-4">
            <div className="text-center space-y-2">
                <Typography variant="heading-lg" className="text-3xl font-bold">
                    {t('contact.page.title')}
                </Typography>
                <Typography
                    variant="body"
                    className="text-gray-600 dark:text-gray-400"
                >
                    {t('contact.page.description')}
                </Typography>
            </div>

            <form className="w-full" onSubmit={handleSubmit} ref={formRef}>
                <ContactForm errors={formErrors} pending={isPending} />
            </form>
        </div>
    );
};

function extractFormData(data: FormData): ContactFormData {
    return {
        name: data.get('name') as string,
        email: data.get('email') as string,
        subject: data.get('subject') as string,
        message: data.get('message') as string
    };
}
