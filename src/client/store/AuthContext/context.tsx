'use client';

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import type { UserDTO } from '@/common/types';
import { useQueryClient } from '@tanstack/react-query';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';

type AuthContextType = {
    authResolved: boolean;
    user: UserDTO | null;
    setUser: (user: UserDTO | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

type AuthProviderProps = Readonly<NonNullable<unknown>> &
    React.PropsWithChildren<NonNullable<unknown>>;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const queryClient = useQueryClient();
    const { data: user = null, isLoading } = chqc.auth.useCurrentUser({});

    const setUser = useCallback(
        (newUser: UserDTO | null) => {
            queryClient.setQueryData(QUERY_KEYS.auth.currentUser, newUser);
        },
        [queryClient]
    );

    const authResolved = useMemo(
        () => (user ? true : !isLoading),
        [isLoading, user]
    );

    const contextValue = useMemo(
        () => ({
            authResolved,
            user: user ?? null,
            setUser
        }),
        [authResolved, setUser, user]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
