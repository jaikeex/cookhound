'use client';

import { useCallback } from 'react';
import {
    ENV_CONFIG_PUBLIC,
    GOOGLE_SIGNIN_REDIRECT_URL,
    OAUTH_STATE_KEY
} from '@/common/constants';
import { useEventListener } from '@/client/hooks';
import type { UserDTO } from '@/common/types';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { generateUuid } from '@/client/utils';

type UseGoogleSignInArgs = {
    onSuccess?: (user: UserDTO) => void;
};

type UseGoogleSignInType = (options: UseGoogleSignInArgs) => {
    signInUserWithGoogleOauth: () => void;
    error: Error | null;
    isPending: boolean;
};

export const useGoogleSignIn: UseGoogleSignInType = ({ onSuccess }) => {
    const queryClient = useQueryClient();
    const {
        mutate: loginWithGoogleOauth,
        error,
        isPending
    } = chqc.auth.useLoginWithGoogleOauth({
        onSuccess: (user) => {
            onSuccess?.(user);
            queryClient.setQueryData(QUERY_KEYS.auth.currentUser, user);
        }
    });

    const signInUserWithGoogleOauth = useCallback(() => {
        const state = generateUuid();
        sessionStorage.setItem(OAUTH_STATE_KEY, state);

        const url = `${GOOGLE_SIGNIN_REDIRECT_URL}&state=${encodeURIComponent(state)}`;

        const screenLeft = window.screenLeft ?? window.screenX ?? 0;
        const screenTop = window.screenTop ?? window.screenY ?? 0;

        const width = window.outerWidth ?? window.screen.width;
        const height = window.outerHeight ?? window.screen.height;

        const features = [
            `left=${screenLeft}`,
            `top=${screenTop}`,
            `width=${width}`,
            `height=${height}`,
            'scrollbars=yes',
            'resizable=yes',
            'popup=true'
        ].join(',');

        window.open(url, 'GoogleSignInPopup', features);
    }, []);

    const handleGoogleSignIn = useCallback(
        async (event: MessageEvent<any>) => {
            if (event.origin !== ENV_CONFIG_PUBLIC.ORIGIN) {
                return;
            }

            if (event.data.error === 'invalid_state') {
                return;
            }

            if (event.data.authCode && event.data.state) {
                const storedState = sessionStorage.getItem(OAUTH_STATE_KEY);

                if (!storedState || storedState !== event.data.state) {
                    return;
                }

                sessionStorage.removeItem(OAUTH_STATE_KEY);

                loginWithGoogleOauth({
                    code: event.data.authCode
                });
            }
        },
        [loginWithGoogleOauth]
    );

    useEventListener<MessageEvent>(
        'message',
        handleGoogleSignIn,
        undefined,
        false
    );

    return { signInUserWithGoogleOauth, error, isPending };
};
