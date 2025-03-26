'use client';
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import type { User } from '@/client/types';
import { authService } from '@/client/services';
import { ENV_CONFIG } from '@/client/constants';

type AuthContextType = {
    authResolved: boolean;
    user: User | null;
    setUser: (user: User | null) => void;
};

const AuthContext = createContext({} as AuthContextType);

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

type AuthProviderProps = React.PropsWithChildren<NonNullable<unknown>>;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authResolved, setAuthResolved] = useState(false);
    const [user, setUser] = useState<User | null | undefined>(undefined);
    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await getCurrentUserOrNull();
            setUser(currentUser);
            setAuthResolved(true);
        };

        fetchUser();
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
        ENV_CONFIG.ENV === 'development' && console.log(user);
    }, [user]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

const getCurrentUserOrNull = async () => {
    try {
        return await authService.getCurrentUser();
    } catch (err) {
        return null;
    }
};
