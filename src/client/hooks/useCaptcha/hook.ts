'use client';

import { useEffect, useState } from 'react';
import { ENV_CONFIG_PUBLIC } from '@/common/constants/env';

/**
 * Injects the google recaptcha script for the duration of the component's lifecycle
 * and removes it (and all related dom artifacts) on unmount.
 *
 * Call this hook once in any page-level component that requires captcha protection.
 * Then call executeCaptcha(action) to obtain a token immediately before submitting the protected form.
 *
 * @returns ready - true once the recaptcha script has loaded.
 */
export function useCaptcha(): { ready: boolean } {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!ENV_CONFIG_PUBLIC.CAPTCHA_SITE_KEY) {
            setReady(true);
            return;
        }

        const script = document.createElement('script');

        script.src = `https://www.google.com/recaptcha/api.js?render=${ENV_CONFIG_PUBLIC.CAPTCHA_SITE_KEY}`;
        script.async = true;

        const existing = document.querySelector(
            `script[src*="recaptcha/api.js"]`
        );

        if (!existing) {
            script.onload = () => {
                window.grecaptcha?.ready(() => setReady(true));
            };

            document.head.appendChild(script);
        } else {
            window.grecaptcha?.ready(() => setReady(true));
        }

        return () => {
            // Remove the badge container div
            const badge = document.querySelector('.grecaptcha-badge');
            badge?.remove();

            // Remove all reCAPTCHA-related <script> tags.
            document
                .querySelectorAll('script[src*="recaptcha"]')
                .forEach((el) => el.remove());

            // Drop the global so executeCaptcha fails fast if called after unmount.
            delete window.grecaptcha;
        };
    }, []);

    return { ready };
}
