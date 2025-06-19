'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import type { SnackbarVariant } from '@/client/components';
import { Snackbar } from '@/client/components';

const AUTO_DISMISS = 4000;

type SnackbarContextType = {
    alert: (a: AlertPayload) => void;
    clearAlerts: () => void;
};

const SnackbarContext = createContext({} as SnackbarContextType);

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);

    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }

    return context;
};

type SnackbarProviderProps = React.PropsWithChildren<NonNullable<unknown>>;

type AlertPayload = {
    message: string;
    variant: SnackbarVariant;
};

type Alert = AlertPayload & {
    id: string;
};

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
    children
}) => {
    const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);

    const activeAlertIds = activeAlerts.join(',');

    useEffect(() => {
        if (activeAlertIds.length > 0) {
            const timer = setTimeout(
                () =>
                    setActiveAlerts((alerts) =>
                        alerts.slice(0, alerts.length - 1)
                    ),
                AUTO_DISMISS
            );
            return () => clearTimeout(timer);
        }
    }, [activeAlertIds, activeAlerts]);

    const alert = useCallback((alert: AlertPayload) => {
        const newAlert = {
            ...alert,
            id: makeId(5)
        };

        setActiveAlerts((alerts) => [newAlert, ...alerts]);
    }, []);

    const removeAlert = useCallback(
        (id: string) => () => {
            setActiveAlerts((alerts) => alerts.filter((a) => a.id !== id));
        },
        []
    );

    const clearAlerts = useCallback(() => {
        setActiveAlerts([]);
    }, []);

    const value = useMemo(() => ({ alert, clearAlerts }), [alert, clearAlerts]);

    return (
        <SnackbarContext.Provider value={value}>
            {children}
            {activeAlerts.map((alertObj) => (
                <Snackbar
                    key={alertObj.id}
                    variant={alertObj.variant}
                    message={alertObj.message}
                    onClose={removeAlert(alertObj.id)}
                />
            ))}
        </SnackbarContext.Provider>
    );
};

export const makeId = (length: number) => {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
    }
    return result;
};
