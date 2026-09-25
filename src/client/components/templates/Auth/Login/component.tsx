'use client';

import React, { useCallback, useState } from 'react';
import type { LoginFormErrors } from '@/client/components/organisms/Form/Login';
import { Divider } from '@/client/components/atoms/Divider';
import { GoogleSigninButton } from '@/client/components/atoms/Button/GoogleSignin';
import { LoginForm } from '@/client/components/organisms/Form/Login';
import { Typography } from '@/client/components/atoms/Typography';
import type { User, UserForLogin } from '@/common/types';
import { z } from 'zod';
import { validateFormData } from '@/client/utils/form';

import { useGoogleSignIn } from '@/client/hooks';
import { useAuth, useSnackbar } from '@/client/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { chqc, QUERY_KEYS } from '@/client/data';
import { hashKey, useQueryClient } from '@tanstack/react-query';
import { AppEvent, eventBus } from '@/client/events';
import { ROUTES } from '@/common/constants';
import { sanitizeReturnTarget } from '@/common/utils/params';
import { t } from '@/client/locales';
import { withServerError } from '@/client/utils';

//~---------------------------------------------------------------------------------------------~//
//$                                          VALIDATION                                         $//
//~---------------------------------------------------------------------------------------------~//

export const loginSchema = z.object({
    email: z
        .email('auth.error.email-invalid')
        .min(1, 'auth.error.email-required'),
    password: z.string().trim().min(1, 'auth.error.password-required'),
    keepLoggedIn: z.boolean({
        error: 'auth.error.keep-logged-in-required'
    })
});

const currentUserQueryHash = hashKey(QUERY_KEYS.auth.currentUser);

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export type LoginTemplateProps = Readonly<{
    callbackUrl?: string;
}>;

export const LoginTemplate: React.FC<LoginTemplateProps> = ({
    callbackUrl
}) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { setUser } = useAuth();
    const { alert } = useSnackbar();
    const formRef = React.useRef<HTMLFormElement>(null);

    const [formErrors, setFormErrors] = useState<LoginFormErrors>({});

    const {
        mutate: login,
        reset: resetLogin,
        isPending,
        error: loginError
    } = chqc.auth.useLogin({
        meta: { errorMessage: false },
        onSuccess: (user) => {
            queryClient.invalidateQueries({
                predicate: (query) => query.queryHash !== currentUserQueryHash
            });

            cleanUpAndRedirectAfterLogin(user);
        }
    });

    /**
     * Cleans up the form and redirects the user to the home page after a successful login.
     */
    const cleanUpAndRedirectAfterLogin = useCallback(
        (user: User) => {
            setUser(user);

            eventBus.emit(AppEvent.USER_LOGGED_IN, user);

            alert({ message: t('auth.success.login'), variant: 'success' });
            formRef.current?.reset();

            router.push(sanitizeReturnTarget(callbackUrl) ?? ROUTES.home);
        },
        [alert, callbackUrl, router, setUser]
    );

    const {
        signInUserWithGoogleOauth,
        reset: resetGoogleSignIn,
        error,
        isPending: isGoogleSignInPending
    } = useGoogleSignIn({
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

            resetLogin();
            resetGoogleSignIn();

            const formElement = event.currentTarget;
            const data = new FormData(formElement);
            let formData: UserForLogin;

            try {
                formData = extractFormData(data);
                const validationErrors: LoginFormErrors =
                    await validateFormData(formData, loginSchema);

                if (Object.keys(validationErrors).length > 0) {
                    setFormErrors(validationErrors);
                    return;
                }
            } catch (error: unknown) {
                setFormErrors({ server: 'auth.error.default' });
                return;
            }

            setFormErrors({});
            login(formData);
        },
        [login, resetLogin, resetGoogleSignIn]
    );

    const handleGoogleSignIn = useCallback(() => {
        resetLogin();
        setFormErrors({});
        signInUserWithGoogleOauth();
    }, [resetLogin, signInUserWithGoogleOauth]);

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4 pt-4">
            <form className="w-full" onSubmit={handleSubmit} ref={formRef}>
                <LoginForm
                    errors={withServerError(formErrors, loginError, error)}
                    pending={isPending || isGoogleSignInPending}
                />
            </form>

            <Typography variant="body-sm" className="text-center">
                <Link href={ROUTES.auth.resetPassword}>
                    {t('auth.form.forgot-password')}
                </Link>
            </Typography>

            <Typography variant="body-sm" className="text-center">
                <Link href={ROUTES.auth.register}>
                    {t('auth.form.not-registered')}
                </Link>
            </Typography>

            <Divider text={t('app.general.or').toUpperCase()} />

            <GoogleSigninButton
                onClick={handleGoogleSignIn}
                label={t('auth.form.continue-with-google')}
                pending={isGoogleSignInPending}
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
