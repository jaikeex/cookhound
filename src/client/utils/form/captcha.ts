import { ENV_CONFIG_PUBLIC } from '@/common/constants/env';
import type { CaptchaAction } from '@/common/types';

/**
 * Executes recaptcha and returns a token.
 *
 * @param action - name for the action being protected.
 */
export function executeCaptcha(action: CaptchaAction): Promise<string> {
    const siteKey = ENV_CONFIG_PUBLIC.CAPTCHA_SITE_KEY;

    if (!siteKey) {
        return Promise.resolve('captcha-bypass');
    }

    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.grecaptcha) {
            reject(new Error('grecaptcha not loaded'));
            return;
        }

        window.grecaptcha.ready(() => {
            window.grecaptcha
                ?.execute(siteKey, { action })
                .then(resolve)
                .catch(reject);
        });
    });
}
