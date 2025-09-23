'use client';

import { useCallback } from 'react';
import {
    ENV_CONFIG_PUBLIC,
    GOOGLE_SIGNIN_REDIRECT_URL
} from '@/common/constants';
import { useEventListener } from '@/client/hooks';
import type { UserDTO } from '@/common/types';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import { useQueryClient } from '@tanstack/react-query';

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
        const screenLeft = window.screenLeft ?? window.screenX ?? 0;
        const screenTop = window.screenTop ?? window.screenY ?? 0;

        // Fallbacks handle browser differences (outerWidth/outerHeight vs. screen)
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

        window.open(GOOGLE_SIGNIN_REDIRECT_URL, 'GoogleSignInPopup', features);
    }, []);

    const handleGoogleSignIn = useCallback(
        async (event: MessageEvent<any>) => {
            if (
                event.origin === ENV_CONFIG_PUBLIC.ORIGIN &&
                event.data.authCode
            ) {
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
