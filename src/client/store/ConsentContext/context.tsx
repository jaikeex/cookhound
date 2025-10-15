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
import type { UserDTO } from '@/common/types';
import { getCookie } from '@/client/utils';
import { eventBus } from '@/client/events';
import { AppEvent } from '@/client/events';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import { CONSENT_VERSION, CONSENT_COOKIE_NAME } from '@/common/constants';
import { setConsentCookie } from '@/app/actions';
import { useAppEventListener } from '@/client/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/client/store/AuthContext';
import { useSnackbar } from '@/client/store/SnackbarContext';
import { useLocale } from '@/client/store';
import { areConsentsEqual } from '@/common/utils';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                  CONSENT SOURCE OF TRUTH                                    ?//
///
//# Anonymous User:
//#   → Browser cookie ONLY
//#
//# Logged-In User:
//#   → Most recent timestamp between cookie and DB
//#   → On conflict, newest ALWAYS wins
//#   → Older one is synced to match
//#
//# Cookie Deleted:
//#   → Treat as explicit opt-out
//#   → Revoke in DB if user is logged in
//#
//# Version Mismatch:
//#   → Discard both cookie and DB
//#   → Force new consent dialog
//#
//# User Switch (Logout → Login):
//#   → Clear userId from consent on logout
//#   → Compare new user's DB consent with browser consent
//#   → Use most recent consent
///
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
                        query.queryKey[0] === QUERY_KEYS.user.namespace ||
                        query.queryKey[0] === QUERY_KEYS.auth.namespace
                });
            }
        });

    //|-----------------------------------------------------------------------------------------|//
    //?                                         UPDATE                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const setConsentAndEmit = useCallback((consent: CookieConsent | null) => {
        setConsent(consent);

        //! NEVER REMOVE THIS
        eventBus.emit(AppEvent.CONSENT_CHANGED, consent);
    }, []);

    const updateConsent = useCallback(
        async (accepted: ConsentCategory[], consent: boolean) => {
            const now = new Date();

            const browserConsent: CookieConsentFromBrowser = {
                consent,
                version: CONSENT_VERSION,
                accepted,
                createdAt: now,
                userId: user?.id.toString() ?? null
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

                    await createUserCookieConsent(payloadForDb);
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
    //#                                  -> re-hydrate from db (no revocation).
    ///
    //|-----------------------------------------------------------------------------------------|//

    const verifyConsent = useCallback(async () => {
        const cookie = readConsentCookie();
        const isConsentChanged = !areConsentsEqual(cookie, consent);

        // Case 1: Cookie deleted by user (treat as explicit opt-out)
        if (!cookie) {
            if (consent) {
                await rejectAll();
            }
            return;
        }

        // Case 2: Cookie modified
        if (isConsentChanged) {
            // For logged-in users, verify against DB as authoritative source
            if (user?.id) {
                try {
                    // Fetch fresh user data to get latest consent
                    const currentUserData = queryClient.getQueryData(
                        QUERY_KEYS.auth.currentUser
                    ) as UserDTO | null;

                    const dbConsent = currentUserData?.cookieConsent?.[0];

                    if (dbConsent && !dbConsent.revokedAt) {
                        // DB is authoritative for logged-in users
                        setConsentAndEmit(dbConsent);
                        await setConsentCookie(dbConsent);
                        return;
                    }
                } catch (error) {
                    /**
                     * Do nothing here
                     */
                }
            }

            // Fall back to cookie value for anonymous users or if DB check fails
            setConsentAndEmit(cookie);
        }
    }, [consent, user, rejectAll, setConsentAndEmit, queryClient]);

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

    useAppEventListener(AppEvent.USER_LOGGED_IN, async (newUser) => {
        if (!newUser.id || !consent) return;

        const userDbConsent = newUser.cookieConsent?.[0];

        // Case 1: User has valid DB consent
        if (userDbConsent && !userDbConsent.revokedAt) {
            const browserTime = new Date(consent.createdAt).getTime();
            const dbTime = new Date(userDbConsent.createdAt).getTime();

            if (dbTime > browserTime) {
                // DB consent is newer - use it
                setConsentAndEmit(userDbConsent);
                await setConsentCookie(userDbConsent);
            } else {
                // Browser consent is newer - sync to DB and update cookie with userId
                const payloadForDb: CookieConsentPayload = {
                    consent: true,
                    version: consent.version,
                    accepted: consent.accepted,
                    createdAt: consent.createdAt ?? new Date()
                };

                await createUserCookieConsent(payloadForDb);

                // Update cookie with userId
                const updatedConsent: CookieConsentFromBrowser = {
                    consent: consent.consent,
                    version: consent.version,
                    accepted: consent.accepted,
                    createdAt: consent.createdAt,
                    userId: newUser.id.toString()
                };

                setConsentAndEmit(updatedConsent);
                await setConsentCookie(updatedConsent);
            }
        } else {
            // Case 2: No DB consent or revoked - sync browser to DB and update cookie with userId
            const payloadForDb: CookieConsentPayload = {
                consent: true,
                version: consent.version,
                accepted: consent.accepted,
                createdAt: consent.createdAt ?? new Date()
            };

            await createUserCookieConsent(payloadForDb);

            // Update cookie with userId
            const updatedConsent: CookieConsentFromBrowser = {
                consent: consent.consent,
                version: consent.version,
                accepted: consent.accepted,
                createdAt: consent.createdAt,
                userId: newUser.id.toString()
            };

            setConsentAndEmit(updatedConsent);
            await setConsentCookie(updatedConsent);
        }
    });

    useAppEventListener(AppEvent.USER_LOGGED_OUT, () => {
        // Keep browser consent but clear user association
        if (consent) {
            const anonymousConsent: CookieConsentFromBrowser = {
                consent: consent.consent,
                version: consent.version,
                accepted: consent.accepted,
                createdAt: consent.createdAt,
                userId: null
            };

            setConsentAndEmit(anonymousConsent);
            setConsentCookie(anonymousConsent);
        }
    });

    useEffect(() => {
        consentRef.current = consent;
    }, [consent]);

    // Emit initial consent on mount for subscribers
    useEffect(() => {
        eventBus.emit(AppEvent.CONSENT_CHANGED, consent);
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
        const raw = getCookie(CONSENT_COOKIE_NAME);

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
