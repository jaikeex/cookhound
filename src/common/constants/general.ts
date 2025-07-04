import { ENV_CONFIG_PUBLIC } from '@/common/constants/env';

export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = ['en', 'cs'] as const;

export const GOOGLE_SIGNIN_REDIRECT_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${ENV_CONFIG_PUBLIC.GOOGLE_OAUTH_CLIENT_ID}&redirect_uri=${ENV_CONFIG_PUBLIC.ORIGIN}/auth/callback/google&response_type=code&scope=email%20profile&access_type=offline`;

export const SEARCH_QUERY_SEPARATOR = '|';

export const LOCAL_STORAGE_LAST_VIEWED_RECIPES_KEY = 'lastViewedRecipes';

export const SESSION_COOKIE_NAME = 'session';
