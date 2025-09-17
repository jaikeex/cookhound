'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    useEffect,
    useRef,
    type PropsWithChildren
} from 'react';
import type {
    ConsentCategory,
    CookieConsentFromBrowser,
    CookieConsent,
    CookieConsentPayload
} from '@/common/types/cookie-consent';
import { getCookie } from '@/client/utils';
import { eventBus } from '@/client/events';
import { Event } from '@/client/events';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import { CONSENT_VERSION, COOKIE_NAME } from '@/common/constants';
import { setConsentCookie } from '@/app/actions';
import { useAppEventListener } from '@/client/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/client/store/AuthContext';
import { useSnackbar } from '@/client/store/SnackbarContext';
import { useLocale } from '@/client/store';
import { areConsentsEqual } from '@/common/utils';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                  HANDLING CONSENT CHANGE                                    ?//
///
//# This context exposes two different ways of notifying the app about consent changes.
//#   (1) - simply calling the hook and reading the return value
//#       - nothing special to see here, standard approach
//#
//#   (2) - listening to Event.CONSENT_CHANGED emits
//#       - alternative way for places that don't need the entire hook
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

//~---------------------------------------------------------------------------------------------~//
//$                                            TYPES                                            $//
//~---------------------------------------------------------------------------------------------~//

interface ConsentContextType {
    consent: CookieConsent | null;
    acceptAll: () => Promise<void>;
    rejectAll: () => Promise<void>;
    updateConsent: (
        accepted: ConsentCategory[],
        consent: boolean
    ) => Promise<void>;
    canUsePreferences: boolean;
    canUseAnalytics: boolean;
    canUseMarketing: boolean;
}

//~---------------------------------------------------------------------------------------------~//
//$                                             HOOK                                            $//
//~---------------------------------------------------------------------------------------------~//

export const useConsent = (): ConsentContextType => {
    const context = useContext(ConsentContext);

    if (!context) {
        throw new Error('useConsent must be used within a ConsentProvider');
    }

    return context;
};

//~---------------------------------------------------------------------------------------------~//
//$                                           CONTEXT                                           $//
//~---------------------------------------------------------------------------------------------~//

const ConsentContext = createContext({} as ConsentContextType);

type ConsentProviderProps = Readonly<{
    initialConsent?: CookieConsent | null;
}> &
    PropsWithChildren<NonNullable<unknown>>;

export const ConsentProvider: React.FC<ConsentProviderProps> = ({
    children,
    initialConsent
}) => {
    //|-----------------------------------------------------------------------------------------|//
    //?                                          STATE                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const { user } = useAuth();
    const { alert } = useSnackbar();
    const { t } = useLocale();
    const queryClient = useQueryClient();

    const [consent, setConsent] = useState<CookieConsent | null>(
        () => initialConsent ?? readConsentCookie()
    );

    const canUsePreferences = useMemo(
        () => consent?.accepted.includes('preferences') ?? false,
        [consent]
    );

    const canUseAnalytics = useMemo(
        () => consent?.accepted.includes('analytics') ?? false,
        [consent]
    );

    const canUseMarketing = useMemo(
        () => consent?.accepted.includes('marketing') ?? false,
        [consent]
    );

    // Holds latest consent for use inside stable callbacks
    const consentRef = useRef<CookieConsent | null>(consent);

    /**
     * Cross-tab synchronisation channel.
     */
    const channelRef = useRef<BroadcastChannel | null>(null);

    const { mutateAsync: createUserCookieConsent } =
        chqc.user.useCreateUserCookieConsent({
            retry: 3,
            onSuccess: () => {
                queryClient.invalidateQueries({
                    predicate: (query) =>
                        query.queryKey[0] === QUERY_KEYS.user.namespace
                });
            }
        });

    //|-----------------------------------------------------------------------------------------|//
    //?                                         UPDATE                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const setConsentAndEmit = useCallback((consent: CookieConsent | null) => {
        setConsent(consent);

        //! NEVER REMOVE THIS
        eventBus.emit(Event.CONSENT_CHANGED, consent);
    }, []);

    const updateConsent = useCallback(
        async (accepted: ConsentCategory[], consent: boolean) => {
            const now = new Date();

            const browserConsent: CookieConsentFromBrowser = {
                consent,
                version: CONSENT_VERSION,
                accepted,
                createdAt: now
            };

            const previousConsent = consentRef.current;

            setConsentAndEmit(browserConsent);

            // Notify other tabs immediately
            channelRef.current?.postMessage(browserConsent);

            try {
                await setConsentCookie(browserConsent);

                if (user?.id) {
                    const payloadForDb: CookieConsentPayload = {
                        ...browserConsent,
                        createdAt: now
                    };

                    await createUserCookieConsent({
                        userId: user.id,
                        data: payloadForDb
                    });
                }
            } catch (error) {
                alert({
                    message: t('app.cookies.error.failed-to-save'),
                    variant: 'error'
                });

                // rollback
                setConsentAndEmit(previousConsent ?? null);
            }
        },
        [user, createUserCookieConsent, alert, t, setConsentAndEmit]
    );

    const acceptAll = useCallback(async () => {
        await updateConsent(
            ['essential', 'preferences', 'analytics', 'marketing'],
            true
        );
    }, [updateConsent]);

    const rejectAll = useCallback(async () => {
        await updateConsent(['essential'], false);
    }, [updateConsent]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                      CROSS-TAB SYNC                                     ?//
    ///
    //# Ensures that the react state follows the cookie rather than the other way around.
    //#     If the cookie is missing -> true bail out by user (sad...)
    //#                              -> essential only.
    //#     If cookie exists but differs -> wannabe developer
    //#                                  -> re-hydrate from cookie (no revocation).
    ///
    //|-----------------------------------------------------------------------------------------|//

    const verifyConsent = useCallback(() => {
        const cookie = readConsentCookie();

        const isConsentChanged = !areConsentsEqual(cookie, consent);

        if (!cookie) {
            if (consent) rejectAll();
            return;
        }

        if (isConsentChanged) {
            setConsentAndEmit(cookie);
        }
    }, [consent, rejectAll, setConsentAndEmit]);

    useEffect(() => {
        window.addEventListener('focus', verifyConsent);

        const handleVisibility = () => {
            if (!document.hidden) verifyConsent();
        };

        document.addEventListener('visibilitychange', handleVisibility);

        // BroadcastChannel for real-time cross-tab updates
        try {
            channelRef.current = new BroadcastChannel('cookie-consent');

            channelRef.current.onmessage = (e) => {
                const incoming = e.data as CookieConsent;
                // Ignore if identical to current state
                if (!areConsentsEqual(incoming, consentRef.current)) {
                    setConsentAndEmit(incoming);
                }
            };
        } catch {
            /**
             * Do nothing here, the channel is a preferred way to signal changes,
             * but there are two failsafes remaining.
             */
        }

        return () => {
            window.removeEventListener('focus', verifyConsent);
            document.removeEventListener('visibilitychange', handleVisibility);
            channelRef.current?.close();
        };
    }, [setConsentAndEmit, verifyConsent]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                         EFFECTS                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    useAppEventListener(Event.USER_LOGGED_IN, (user) => {
        if (user.id && consent) {
            const payloadForDb: CookieConsentPayload = {
                consent: true,
                version: consent.version,
                accepted: consent.accepted,
                createdAt: consent.createdAt ?? new Date()
            };

            createUserCookieConsent({ userId: user.id, data: payloadForDb });
        }
    });

    useEffect(() => {
        consentRef.current = consent;
    }, [consent]);

    // Emit initial consent on mount for subscribers
    useEffect(() => {
        eventBus.emit(Event.CONSENT_CHANGED, consent);
    }, [consent]);

    useEffect(() => {
        if (initialConsent && !readConsentCookie()) {
            setConsentCookie(initialConsent);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //|-----------------------------------------------------------------------------------------|//
    //?                                     VALUE AND RETURN                                    ?//
    //|-----------------------------------------------------------------------------------------|//

    const contextValue = useMemo(
        () => ({
            consent,
            acceptAll,
            rejectAll,
            updateConsent,
            canUsePreferences,
            canUseAnalytics,
            canUseMarketing
        }),
        [
            consent,
            acceptAll,
            rejectAll,
            updateConsent,
            canUsePreferences,
            canUseAnalytics,
            canUseMarketing
        ]
    );

    return (
        <ConsentContext.Provider value={contextValue}>
            {children}
        </ConsentContext.Provider>
    );
};

//~---------------------------------------------------------------------------------------------~//
//$                                       HELPER FUNCTIONS                                      $//
//~---------------------------------------------------------------------------------------------~//

function readConsentCookie(): CookieConsent | null {
    // Never run this on the server
    if (typeof window === 'undefined') return null;

    try {
        const raw = getCookie(COOKIE_NAME);

        if (!raw) {
            return null;
        }

        let parsed = JSON.parse(decodeURIComponent(raw)) as CookieConsent;

        // New version requires new consent
        if (parsed?.version !== CONSENT_VERSION) {
            return null;
        }

        // The date comes as a string from JSON parsing
        if (parsed?.createdAt) {
            parsed = {
                ...parsed,
                createdAt: new Date(parsed.createdAt)
            };
        }

        return parsed;
    } catch {
        return null;
    }
}
