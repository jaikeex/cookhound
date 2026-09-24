'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import { Snackbar } from '@/client/components/molecules/Snackbar';
import type { AlertPayload, SnackbarPosition } from '@/client/types';
import ReactDOM from 'react-dom';
import { classNames, generateRandomId } from '@/client/utils';

const AUTO_DISMISS = 4000;
const ACTION_AUTO_DISMISS = 10000;
const MAX_SNACKBARS = 3;

const SNACKBAR_POSITIONS: readonly SnackbarPosition[] = ['top', 'bottom'];

/**
 * One fixed flex column per position, so each snackbar takes its real height and wrapped
 * messages push the next one along instead of overlapping it. The newest
 * alert sits nearest the screen edge: first at the top, last at the bottom,
 * where the stack also has to clear the mobile bottom navigation hidden from md up.
 */
const STACK_CLASSNAME: Record<SnackbarPosition, string> = {
    top: 'top-4 flex-col',
    bottom: 'bottom-[4.5rem] md:bottom-4 flex-col-reverse'
};

type SnackbarContextType = {
    alert: (a: AlertPayload) => void;
    clearAlerts: () => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(
    undefined
);

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
        if (activeAlerts.length === 0) return;

        const oldest = activeAlerts[activeAlerts.length - 1];

        const timer = setTimeout(
            () =>
                setActiveAlerts((alerts) => alerts.slice(0, alerts.length - 1)),
            oldest?.action ? ACTION_AUTO_DISMISS : AUTO_DISMISS
        );

        return () => clearTimeout(timer);
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
                SNACKBAR_POSITIONS.map((position) => {
                    const alerts = activeAlerts.filter(
                        (a) => (a.position ?? 'top') === position
                    );

                    if (alerts.length === 0) {
                        return null;
                    }

                    return ReactDOM.createPortal(
                        <div
                            key={position}
                            className={classNames(
                                'fixed left-1/2 -translate-x-1/2 z-2000 flex gap-2',
                                'w-96 max-w-[calc(100vw-2rem)] pointer-events-none',
                                STACK_CLASSNAME[position]
                            )}
                        >
                            {alerts.map((alertObj) => (
                                <Snackbar
                                    key={alertObj.id}
                                    action={alertObj.action}
                                    variant={alertObj.variant}
                                    message={alertObj.message}
                                    onClose={removeAlert(alertObj.id)}
                                />
                            ))}
                        </div>,
                        document.body,
                        position
                    );
                })}
        </SnackbarContext.Provider>
    );
};
