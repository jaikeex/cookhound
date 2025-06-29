'use client';
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import type { UserDTO } from '@/common/types';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import apiClient from '@/client/request';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({
    children,
    user: initialUser,
    authResolved: initialAuthResolved
}) => {
    const [authResolved, setAuthResolved] = useState(
        initialAuthResolved ?? false
    );

    const [user, setUser] = useState<UserDTO | null | undefined>(
        initialUser ?? null
    );

    useEffect(() => {
        const fetchUser = async () => {
            // This check is sufficient, no need to check the initial values.
            if (user && authResolved) {
                return;
            }

            const currentUser = await getCurrentUserOrNull();
            setUser(currentUser);
            setAuthResolved(true);
        };

        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const contextValue = useMemo(
        () => ({
            authResolved,
            user: user === undefined ? null : user,
            setUser
        }),
        [authResolved, user]
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

const getCurrentUserOrNull = async () => {
    try {
        return await apiClient.auth.getCurrentUser();
    } catch (err) {
        return null;
    }
};
