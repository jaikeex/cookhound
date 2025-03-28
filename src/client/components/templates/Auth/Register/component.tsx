'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { ObjectSchema } from 'yup';
import { object, ref, string } from 'yup';
import type { UserForCreate } from '@/common/types';
import { userService } from '@/client/services';
import { useGoogleSignIn } from '@/client/hooks';
import type { SubmitHandler } from '@/client/components/organisms/Form/types';
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
import type { User } from '@/common/types';

export type RegisterTemplateProps = NonNullable<unknown>;

type UserForCreateFormData = {
    username: string;
    email: string;
    password: string;
    repeatPassword: string;
};

export const registerSchema: ObjectSchema<UserForCreate> = object({
    username: string()
        .matches(/^[a-zA-Z0-9_]*$/, 'auth.error.invalid-characters')
        .required('auth.error.username-required')
        .min(3, 'auth.error.username-min-length')
        .max(20, 'auth.error.username-max-length'),
    email: string()
        .email('auth.error.email-invalid')
        .required('auth.error.email-required'),
    password: string()
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
            'auth.error.password-missing-character'
        )
        .min(6, 'auth.error.password-min-length')
        .max(40, 'auth.error.password-max-length')
        .required('auth.error.password-required'),
    repeatPassword: string()
        .oneOf([ref('password')], 'auth.error.passwords-dont-match')
        .required('auth.error.repeat-password-required')
});

export const RegisterTemplate: React.FC<RegisterTemplateProps> = () => {
    const formRef = React.useRef<HTMLFormElement>(null);

    const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});

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
        (user: User) => {
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
    const handleSubmit: SubmitHandler = useCallback(
        async (data: FormData) => {
            let formData: UserForCreateFormData;

            try {
                formData = extractFormData(data);
                const validationErrors: RegisterFormErrors =
                    await validateFormData(formData, registerSchema);

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
                const userForCreate: UserForCreate = {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                };

                await userService.createUser(userForCreate);
                alert({
                    message: t('auth.success.register'),
                    variant: 'success'
                });
                cleanUpAndRedirectAfterSubmit(
                    `/auth/verify-email?email=${formData.email}`
                );
            } catch (error: any) {
                setFormErrors({
                    server: error.message ?? 'auth.error.default'
                });
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
            <form className="w-full" action={handleSubmit} ref={formRef}>
                <RegisterForm errors={formErrors} />
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
