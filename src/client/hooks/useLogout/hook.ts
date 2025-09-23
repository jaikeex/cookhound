import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { chqc } from '@/client/request/queryClient';
import { useAuth, useLocale, useSnackbar } from '@/client/store';
import { AppEvent, eventBus } from '@/client/events';

/**
 * Hook that logs the current user out and performs all required clean-up on success.
 */
export const useLogout = () => {
    const { setUser } = useAuth();
    const { alert } = useSnackbar();
    const { t } = useLocale();

    const router = useRouter();
    const queryClient = useQueryClient();

    const { mutate, isPending, error } = chqc.auth.useLogout({
        onSuccess: () => {
            alert({
                message: t('auth.success.logout'),
                variant: 'success'
            });

            setUser(null);
            queryClient.clear();
            eventBus.emit(AppEvent.USER_LOGGED_OUT, undefined);
            router.push('/');
        }
    });

    const logout = useCallback(() => {
        mutate(undefined);
    }, [mutate]);

    return {
        logout,
        isPending,
        error
    };
};
