'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { LoginFormErrors } from '@/client/components';
import {
    Divider,
    GoogleSigninButton,
    LoginForm,
    Typography
} from '@/client/components';
import type { UserDTO, UserForLogin } from '@/common/types';
import apiClient from '@/client/request';
import { z } from 'zod';
import { validateFormData } from '@/client/utils/form';

import { useGoogleSignIn } from '@/client/hooks';
import { useAuth, useLocale, useSnackbar } from '@/client/store';
import type { I18nMessage } from '@/client/locales';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export type LoginTemplateProps = Readonly<{
    callbackUrl?: string;
}>;

export const loginSchema = z.object({
    email: z
        .string()
        .email('auth.error.email-invalid')
        .min(1, 'auth.error.email-required'),
    password: z.string().trim().min(1, 'auth.error.password-required'),
    keepLoggedIn: z.boolean({
        required_error: 'auth.error.keep-logged-in-required'
    })
});

export const LoginTemplate: React.FC<LoginTemplateProps> = ({
    callbackUrl
}) => {
    const formRef = React.useRef<HTMLFormElement>(null);

    const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();
    const { setUser } = useAuth();
    const { alert } = useSnackbar();
    const { t } = useLocale();

    /**
     * Cleans up the form and redirects the user to the home page after a successful login.
     */
    const cleanUpAndRedirectAfterLogin = useCallback(
        (user: UserDTO) => {
            setUser(user);

            alert({ message: t('auth.success.login'), variant: 'success' });
            formRef.current?.reset();
            router.push(callbackUrl ?? '/');
        },
        [alert, callbackUrl, router, setUser, t]
    );

    // Custom hook to handle Google sign-in.
    const { signInUserWithGoogleOauth, error } = useGoogleSignIn({
        onSuccess: cleanUpAndRedirectAfterLogin
    });

    /**
     * Handles the form submission.
     * Validates the form data and populate the form errors if necessary.
     * If the form data is valid, it sends a login request to the server.
     * If the login request is successful, the cleanup function is called.
     */
    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const formElement = event.currentTarget;
            const data = new FormData(formElement);
            let formData: UserForLogin;

            setIsSubmitting(true);

            try {
                formData = extractFormData(data);
                const validationErrors: LoginFormErrors =
                    await validateFormData(formData, loginSchema);

                if (Object.keys(validationErrors).length > 0) {
                    setFormErrors(validationErrors);
                    setIsSubmitting(false);
                    return;
                }
            } catch (error) {
                setFormErrors({ server: 'auth.error.default' });
                setIsSubmitting(false);
                return;
            }

            try {
                setFormErrors({});

                const user = await apiClient.auth.login(formData);
                cleanUpAndRedirectAfterLogin(user);
            } catch (error: any) {
                setFormErrors({
                    server: error.message ?? 'auth.error.default'
                });
            } finally {
                setIsSubmitting(false);
            }
        },
        [cleanUpAndRedirectAfterLogin]
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
                <LoginForm errors={formErrors} pending={isSubmitting} />
            </form>

            <Typography variant="body-sm" className="text-center">
                <Link href={'/auth/reset-password'}>
                    {t('auth.form.forgot-password')}
                </Link>
            </Typography>

            <Typography variant="body-sm" className="text-center">
                <Link href={'/auth/register'}>
                    {t('auth.form.not-registered')}
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

function extractFormData(data: FormData): UserForLogin {
    return {
        email: data.get('email') as string,
        password: data.get('password') as string,
        keepLoggedIn: data.get('keep-logged-in') === 'on'
    };
}
