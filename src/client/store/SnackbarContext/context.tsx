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
import { generateRandomId } from '@/client/utils';

const AUTO_DISMISS = 4000;
const MAX_SNACKBARS = 3;

const SNACKBAR_POSITIONS: readonly SnackbarPosition[] = ['top', 'bottom'];

/**
 * The bottom stack has to clear the mobile bottom navigation and drops to a plain inset
 * from md up, where that navigation is hidden. The offset is responsive, so it cannot
 * live in the inline style like the top stack's does - only the per-snackbar step is passed in.
 */
const BOTTOM_STACK_CLASSNAME =
    'bottom-[calc(4.5rem+var(--snackbar-offset))] md:bottom-[calc(1rem+var(--snackbar-offset))]';

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
                SNACKBAR_POSITIONS.flatMap((position) =>
                    activeAlerts
                        .filter((a) => (a.position ?? 'top') === position)
                        .map((alertObj, index) =>
                            ReactDOM.createPortal(
                                <div
                                    key={alertObj.id}
                                    className={
                                        position === 'bottom'
                                            ? BOTTOM_STACK_CLASSNAME
                                            : undefined
                                    }
                                    style={{
                                        width: '384px',
                                        margin: '0 auto',
                                        position: 'fixed',
                                        // 16px initial offset + 70px per snackbar
                                        ...(position === 'top'
                                            ? { top: `${16 + index * 70}px` }
                                            : ({
                                                  '--snackbar-offset': `${index * 70}px`
                                              } as React.CSSProperties)),
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
                        )
                )}
        </SnackbarContext.Provider>
    );
};
