'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useConsent } from '@/client/store';
import { setCookie } from '@/client/utils';
import { ENV_CONFIG_PUBLIC } from '@/common/constants/env';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                              CONSENT-GATED GOOGLE ANALYTICS                                 ?//
///
//# GDPR restricts this: gtag.js is NEVER loaded (no script, no cookies, no Consent Mode pings)
//# until the user explicitly grants the analytics consent category. The flow here is:
//#
//#   grant    → clear the ga-disable kill switch, bootstrap the dataLayer/gtag stub
//#              (consent defaults + config are queued before the script loads), then
//#              mount the external gtag.js script.
//#   revoke   → a loaded script cannot be unloaded, so set the
//#              window['ga-disable-<ID>'] kill switch and delete the _ga/_ga_* cookies.
//#   re-grant → clear the kill switch again; the already loaded script resumes.
//#
//# Ad-related consent signals are permanently denied. The marketing category is
//# deliberately NOT wired to GA and Google Signals is disabled (also in GA admin).
//#
//# Page views are tracked manually (send_page_view: false) on pathname changes only.
//# Query strings are intentionally excluded: /vyhledavani?q=... carries user-typed
//# search terms which must not be sent to Google (data minimization).
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

const GA_ID = ENV_CONFIG_PUBLIC.GA_MEASUREMENT_ID;

function deleteGaCookies(measurementId: string): void {
    const names = ['_ga', `_ga_${measurementId.replace(/^G-/, '')}`];

    for (const name of names) {
        // Registrable-domain variant
        setCookie(name, '', { maxAge: 0 });
        // Host-only variant: the explicit undefined overrides the default domain
        setCookie(name, '', { maxAge: 0, domain: undefined });
    }
}

/**
 * Must be mounted inside ConsentProvider.
 */
export const GoogleAnalytics: React.FC = () => {
    const { canUseAnalytics } = useConsent();
    const pathname = usePathname();

    const [loadScript, setLoadScript] = useState(false);

    // Guards against strict mode double effects.
    const lastTrackedPath = useRef<string | null>(null);

    //|-----------------------------------------------------------------------------------------|//
    //?                                  GRANT / REVOKE / RE-GRANT                              ?//
    //|-----------------------------------------------------------------------------------------|//

    useEffect(() => {
        if (!GA_ID) {
            return;
        }

        if (canUseAnalytics) {
            // Clear the kill switch BEFORE anything else so no hit is dropped
            window[`ga-disable-${GA_ID}`] = false;

            // Keyed on window state so it survives HMR remounts
            if (!window.dataLayer) {
                window.dataLayer = [];
                window.gtag = function gtag() {
                    // gtag.js requires the Arguments object, not an array
                    window.dataLayer?.push(arguments);
                };

                window.gtag('consent', 'default', {
                    analytics_storage: 'granted',
                    ad_storage: 'denied',
                    ad_user_data: 'denied',
                    ad_personalization: 'denied'
                });

                window.gtag('js', new Date());
                window.gtag('config', GA_ID, {
                    send_page_view: false,
                    allow_google_signals: false,
                    allow_ad_personalization_signals: false,
                    ...(ENV_CONFIG_PUBLIC.ENV !== 'production'
                        ? { debug_mode: true }
                        : {})
                });
            }

            setLoadScript(true);
        } else if (window.dataLayer) {
            window[`ga-disable-${GA_ID}`] = true;
            deleteGaCookies(GA_ID);
            lastTrackedPath.current = null;
        }
    }, [canUseAnalytics]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                     PAGE VIEW TRACKING                                  ?//
    //|-----------------------------------------------------------------------------------------|//

    useEffect(() => {
        if (!GA_ID || !canUseAnalytics || !window.gtag) return;
        if (lastTrackedPath.current === pathname) return;

        lastTrackedPath.current = pathname;

        // page_title is intentionally left out, the app router updates
        // document.title after navigation, so it would report the previous page
        window.gtag('event', 'page_view', {
            page_path: pathname,
            page_location: window.location.origin + pathname
        });
    }, [pathname, canUseAnalytics]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                          RENDER                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    if (!GA_ID || !loadScript) return null;

    return (
        <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
        />
    );
};
