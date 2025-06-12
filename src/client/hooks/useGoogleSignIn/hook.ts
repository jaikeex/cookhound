'use client';

import { useCallback, useState } from 'react';
import {
    ENV_CONFIG_PUBLIC,
    GOOGLE_SIGNIN_REDIRECT_URL
} from '@/common/constants';
import apiClient from '@/client/request';
import { useEventListener } from '@/client/hooks';
import type { UserDTO } from '@/common/types';

type UseGoogleSignInArgs = {
    onSuccess?: (user: UserDTO) => void;
};

type UseGoogleSignInType = (options: UseGoogleSignInArgs) => {
    signInUserWithGoogleOauth: () => void;
    error: string | null;
};

export const useGoogleSignIn: UseGoogleSignInType = ({ onSuccess }) => {
    const [error, setError] = useState<string | null>(null);

    const signInUserWithGoogleOauth = useCallback(() => {
        window.open(
            GOOGLE_SIGNIN_REDIRECT_URL,
            'GoogleSignInPopup',
            'width=500,height=600,scrollbars=yes,resizable=yes,popup=true'
        );
    }, []);

    const handleGoogleSignIn = useCallback(
        async (event: MessageEvent<any>) => {
            if (
                event.origin === ENV_CONFIG_PUBLIC.ORIGIN &&
                event.data.authCode
            ) {
                try {
                    const user = await apiClient.auth.loginWithGoogleOauth({
                        code: event.data.authCode
                    });
                    onSuccess && onSuccess(user);
                } catch (error: any) {
                    setError(error.message);
                    return;
                }
            }
        },
        [onSuccess]
    );

    useEventListener<MessageEvent>(
        'message',
        handleGoogleSignIn,
        undefined,
        false
    );

    return { signInUserWithGoogleOauth, error };
};
