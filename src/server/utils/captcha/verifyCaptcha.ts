import { ENV_CONFIG_PRIVATE } from '@/common/constants/env';
import type { CaptchaAction } from '@/common/types';
import { ValidationError } from '@/server/error';
import { Logger } from '@/server/logger';

type RecaptchaVerifyResponse = {
    success: boolean;
    score?: number;
    action?: string;
    'error-codes'?: string[];
};

const SCORE_THRESHOLD = 0.5;

const log = Logger.getInstance('verifyCaptcha');

/**
 * Verifies a recaptcha token against google siteverify api.
 *
 * @throws if the token is invalid, the score is
 * below the threshold, or the action does not match the expected value.
 *
 * @param token  - The captcha token obtained from the client.
 * @param action - The action name used when the token was generated.
 */
export async function verifyCaptcha(
    token: string,
    action: CaptchaAction
): Promise<void> {
    let data: RecaptchaVerifyResponse;

    try {
        const res = await fetch(
            'https://www.google.com/recaptcha/api/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    secret: ENV_CONFIG_PRIVATE.CAPTCHA_SECRET_KEY,
                    response: token
                })
            }
        );

        if (!res.ok) {
            throw new Error(`siteverify returned ${res.status}`);
        }

        data = await res.json();
    } catch (error: unknown) {
        throw new ValidationError('app.error.captcha-failed', undefined, error);
    }

    if (
        !data.success ||
        !data.score ||
        data.score < SCORE_THRESHOLD ||
        data.action !== action
    ) {
        log.warn('verifying captcha token failed', {
            success: data.success,
            score: data.score,
            action: data.action,
            expectedAction: action,
            errorCodes: data['error-codes']
        });

        throw new ValidationError('app.error.captcha-failed');
    }
}
