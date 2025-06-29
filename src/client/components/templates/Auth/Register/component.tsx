'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { UserForCreatePayload } from '@/common/types';
import apiClient from '@/client/request';
import { useGoogleSignIn } from '@/client/hooks';

import type { RegisterFormErrors } from '@/client/components';
import {
    Divider,
    GoogleSigninButton,
    RegisterForm,
    Typography
} from '@/client/components';
import { validateFormData } from '@/client/utils';
import { useRouter } from 'next/navigation';
import { useAuth, useLocale, useSnackbar } from '@/client/store';
import type { I18nMessage } from '@/client/locales';
import Link from 'next/link';
import type { UserDTO } from '@/common/types';
import { z } from 'zod';

export type RegisterTemplateProps = NonNullable<unknown>;

type UserForCreateFormData = {
    username: string;
    email: string;
    password: string;
    repeatPassword: string;
};

export const registerSchema = z
    .object({
        username: z
            .string()
            .regex(/^[a-zA-Z0-9_]*$/, 'auth.error.invalid-characters')
            .min(3, 'auth.error.username-min-length')
            .min(1, 'auth.error.username-required')
            .max(20, 'auth.error.username-max-length'),
        email: z
            .string()
            .email('auth.error.email-invalid')
            .min(1, 'auth.error.email-required'),
        password: z
            .string()
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
                'auth.error.password-missing-character'
            )
            .min(6, 'auth.error.password-min-length')
            .min(1, 'auth.error.password-required')
            .max(40, 'auth.error.password-max-length'),
        repeatPassword: z
            .string()
            .trim()
            .min(1, 'auth.error.repeat-password-required')
    })
    .refine((data) => data.password === data.repeatPassword, {
        message: 'auth.error.passwords-dont-match',
        path: ['repeatPassword']
    });

export const RegisterTemplate: React.FC<RegisterTemplateProps> = () => {
    const formRef = React.useRef<HTMLFormElement>(null);

    const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();
    const { setUser } = useAuth();
    const { alert } = useSnackbar();
    const { t } = useLocale();

    /**
     * Cleans up the form and redirects the user to the provided url after a successful registration.
     */
    const cleanUpAndRedirectAfterSubmit = useCallback(
        (redirectUrl: string) => {
            formRef.current?.reset();
            router.push(redirectUrl);
        },
        [router]
    );

    /**
     * Handles the Google sign-in success event.
     */
    const handleGoogleSignin = useCallback(
        (user: UserDTO) => {
            setUser(user);
            alert({
                message: t('auth.success.login'),
                variant: 'success'
            });
            cleanUpAndRedirectAfterSubmit('/');
        },
        [alert, cleanUpAndRedirectAfterSubmit, setUser, t]
    );

    // Custom hook to handle Google sign-in.
    const { signInUserWithGoogleOauth, error } = useGoogleSignIn({
        onSuccess: handleGoogleSignin
    });

    /**
     * Handles the form submission.
     * Validates the form data and populate the form errors if necessary.
     * If the form data is valid, it sends a registration request to the server.
     * If the registration request is successful, the cleanup function is called.
     */
    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const formElement = event.currentTarget;
            const data = new FormData(formElement);
            let formData: UserForCreateFormData;

            setIsSubmitting(true);

            try {
                formData = extractFormData(data);
                const validationErrors: RegisterFormErrors =
                    await validateFormData(formData, registerSchema);

                if (Object.keys(validationErrors).length > 0) {
                    setFormErrors(validationErrors);
                    setIsSubmitting(false);
                    return;
                }
            } catch (error: unknown) {
                setFormErrors({ server: 'auth.error.default' });
                setIsSubmitting(false);
                return;
            }

            try {
                setFormErrors({});
                const userForCreate: UserForCreatePayload = {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                };

                await apiClient.user.createUser(userForCreate);
                alert({
                    message: t('auth.success.register'),
                    variant: 'success'
                });
                cleanUpAndRedirectAfterSubmit(
                    `/auth/verify-email?email=${formData.email}`
                );
            } catch (error: unknown) {
                setFormErrors({
                    server:
                        error instanceof Error
                            ? (error.message as I18nMessage)
                            : 'auth.error.default'
                });
            } finally {
                setIsSubmitting(false);
            }
        },
        [alert, cleanUpAndRedirectAfterSubmit, t]
    );

    // Update the form errors whenever the google signin process fails.
    useEffect(() => {
        if (error) {
            setFormErrors({ server: error as I18nMessage });
        }
    }, [error]);

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4">
            <form className="w-full" onSubmit={handleSubmit} ref={formRef}>
                <RegisterForm errors={formErrors} pending={isSubmitting} />
            </form>

            <Typography variant="body-sm" className="text-center">
                <Link href={'/auth/login'}>
                    {t('auth.form.already-registered')}
                </Link>
            </Typography>

            <Divider text={t('app.general.or').toUpperCase()} />

            <GoogleSigninButton
                onClick={signInUserWithGoogleOauth}
                label={t('auth.form.continue-with-google')}
            />
        </div>
    );
};

function extractFormData(data: FormData): UserForCreateFormData {
    return {
        username: data.get('username') as string,
        email: data.get('email') as string,
        password: data.get('password') as string,
        repeatPassword: data.get('repeat-password') as string
    };
}
