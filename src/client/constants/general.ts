import { ENV_CONFIG } from '@/client/constants/env';

export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = ['en', 'cs'] as const;

export const GOOGLE_SIGNIN_REDIRECT_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${ENV_CONFIG.GOOGLE_OAUTH_CLIENT_ID}&redirect_uri=${ENV_CONFIG.ORIGIN}/auth/callback/google&response_type=code&scope=email%20profile&access_type=offline`;
