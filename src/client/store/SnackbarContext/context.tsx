'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import { Snackbar } from '@/client/components';
import type { AlertPayload } from '@/client/types';
import ReactDOM from 'react-dom';
import { generateRandomId } from '@/client/utils';

const AUTO_DISMISS = 4000;
const MAX_SNACKBARS = 3;

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
            id: generateRandomId(5)
        };

        setActiveAlerts((alerts) => {
            const newAlerts = [newAlert, ...alerts];
            return newAlerts.slice(0, MAX_SNACKBARS);
        });
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
            {typeof window !== 'undefined' &&
                activeAlerts.map((alertObj, index) =>
                    ReactDOM.createPortal(
                        <div
                            key={alertObj.id}
                            style={{
                                width: '50%',
                                margin: '0 auto',
                                position: 'fixed',
                                top: `${16 + index * 70}px`, // 16px initial offset + 70px per snackbar
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 2000 - index
                            }}
                        >
                            <Snackbar
                                variant={alertObj.variant}
                                message={alertObj.message}
                                onClose={removeAlert(alertObj.id)}
                            />
                        </div>,
                        document.body
                    )
                )}
        </SnackbarContext.Provider>
    );
};
