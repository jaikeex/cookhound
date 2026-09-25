'use client';

import React, { useCallback, useState } from 'react';
import type { ChangeEmailFormErrors } from '@/client/components/organisms/Form/ChangeEmail';
import { ChangeEmailForm } from '@/client/components/organisms/Form/ChangeEmail';
import { useSnackbar } from '@/client/store';
import { validateFormData } from '@/client/utils/form';
import { z } from 'zod';
import { chqc } from '@/client/data';
import { useRouter } from 'next/navigation';
import { t } from '@/client/locales';
import { withServerError } from '@/client/utils';

//~---------------------------------------------------------------------------------------------~//
//$                                          VALIDATION                                         $//
//~---------------------------------------------------------------------------------------------~//

const changeEmailSchema = z.object({
    newEmail: z
        .email('auth.error.email-invalid')
        .min(1, 'auth.error.email-required'),
    password: z.string().trim().min(1, 'auth.error.password-required')
});

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export type ChangeEmailTemplateProps = NonNullable<unknown>;

export const ChangeEmailTemplate: React.FC<ChangeEmailTemplateProps> = () => {
    const { alert } = useSnackbar();
    const router = useRouter();

    const formRef = React.useRef<HTMLFormElement>(null);

    const [formErrors, setFormErrors] = useState<ChangeEmailFormErrors>({});

    const {
        mutate: initiateEmailChange,
        reset: resetInitiateEmailChange,
        isPending,
        error: initiateError
    } = chqc.user.useInitiateEmailChange({
        meta: { errorMessage: false },
        onSuccess: () => {
            alert({
                message: t('auth.change-email.success'),
                variant: 'success'
            });

            formRef.current?.reset();
            router.push('/');
        }
    });

    /**
     * Handles the form submission.
     * Validates the form data and populate the form errors if necessary.
     * If the form data is valid, it sends a request to initiate the email change.
     */
    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            resetInitiateEmailChange();

            const formElement = event.currentTarget;
            const data = new FormData(formElement);

            let formData: { newEmail: string; password: string };

            try {
                formData = extractFormData(data);

                const validationErrors: ChangeEmailFormErrors =
                    await validateFormData(formData, changeEmailSchema);

                if (Object.keys(validationErrors).length > 0) {
                    setFormErrors(validationErrors);
                    return;
                }
            } catch (error: unknown) {
                setFormErrors({ server: 'auth.error.default' });
                return;
            }

            setFormErrors({});
            initiateEmailChange(formData);
        },
        [initiateEmailChange, resetInitiateEmailChange]
    );

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4">
            <form className="w-full" onSubmit={handleSubmit} ref={formRef}>
                <ChangeEmailForm
                    errors={withServerError(formErrors, initiateError)}
                    pending={isPending}
                />
            </form>
        </div>
    );
};

function extractFormData(data: FormData): {
    newEmail: string;
    password: string;
} {
    return {
        newEmail: data.get('newEmail') as string,
        password: data.get('password') as string
    };
}
