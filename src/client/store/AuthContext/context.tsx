'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo
} from 'react';
import type { UserDTO } from '@/common/types';
import { useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';

type AuthContextType = {
    authResolved: boolean;
    user: UserDTO | null;
    setUser: (user: UserDTO | null) => void;
};

const AuthContext = createContext({} as AuthContextType);

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

type AuthProviderProps = Readonly<{
    user?: UserDTO | null;
    authResolved?: boolean;
}> &
    React.PropsWithChildren<NonNullable<unknown>>;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const queryClient = useQueryClient();
    const { data: user, isLoading } = chqc.auth.useCurrentUser();

    const setUser = useCallback(
        (newUser: UserDTO | null) => {
            queryClient.setQueryData(QUERY_KEYS.auth.currentUser, newUser);
        },
        [queryClient]
    );

    const authResolved = !isLoading;

    const contextValue = useMemo(
        () => ({
            authResolved,
            user: user ?? null,
            setUser
        }),
        [authResolved, setUser, user]
    );

    useEffect(() => {
        ENV_CONFIG_PUBLIC.ENV === 'development' && console.log(user);
    }, [user]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
