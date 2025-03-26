'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { LoginFormErrors } from '@/client/components';
import {
    Divider,
    GoogleSigninButton,
    LoginForm,
    Typography
} from '@/client/components';
import type { UserForLogin } from '@/client/services';
import { authService } from '@/client/services';
import type { ObjectSchema } from 'yup';
import { boolean, object, string } from 'yup';
import { validateFormData } from '@/client/utils/form';
import type { SubmitHandler } from '@/client/components/organisms/Form/types';
import { useGoogleSignIn } from '@/client/hooks';
import { useAuth, useLocale, useSnackbar } from '@/client/store';
import type { I18nMessage } from '@/client/locales';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@/client/types';

export type LoginTemplateProps = NonNullable<unknown>;

export const loginSchema: ObjectSchema<UserForLogin> = object({
    email: string()
        .email('auth.error.email-invalid')
        .required('auth.error.email-required'),
    password: string().required('auth.error.password-required'),
    keepLoggedIn: boolean().required('auth.error.keep-logged-in-required')
});

export const LoginTemplate: React.FC<LoginTemplateProps> = () => {
    const formRef = React.useRef<HTMLFormElement>(null);

    const [formErrors, setFormErrors] = useState<LoginFormErrors>({});

    const router = useRouter();
    const { setUser } = useAuth();
    const { alert } = useSnackbar();
    const { t } = useLocale();

    /**
     * Cleans up the form and redirects the user to the home page after a successful login.
     */
    const cleanUpAndRedirectAfterLogin = useCallback(
        (user: User) => {
            setUser(user);

            alert({ message: t('auth.success.login'), variant: 'success' });
            formRef.current?.reset();
            router.push('/');
        },
        [alert, router, setUser, t]
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
    const handleSubmit: SubmitHandler = useCallback(
        async (data: FormData) => {
            let formData: UserForLogin;

            try {
                formData = extractFormData(data);
                const validationErrors: LoginFormErrors =
                    await validateFormData(formData, loginSchema);

                if (Object.keys(validationErrors).length > 0) {
                    setFormErrors(validationErrors);
                    return;
                }
            } catch (error) {
                setFormErrors({ server: 'auth.error.default' });
                return;
            }

            try {
                setFormErrors({});

                const user = await authService.login(formData);
                cleanUpAndRedirectAfterLogin(user);
            } catch (error: any) {
                setFormErrors({
                    server: error.message ?? 'auth.error.default'
                });
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
        <div className="w-full max-w-md mx-auto space-y-4 flex items-center flex-col">
            <form className="w-full" action={handleSubmit} ref={formRef}>
                <LoginForm errors={formErrors} />
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
