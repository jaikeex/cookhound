import { ENV_CONFIG_PUBLIC } from '@/common/constants/env';

//?=============================================================================================?//

export const VERSION = '1.0.2';

//?=============================================================================================?//

export const DEFAULT_LOCALE = 'cs';
export const SUPPORTED_LOCALES = ['en', 'cs'] as const;

export const GOOGLE_SIGNIN_REDIRECT_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${ENV_CONFIG_PUBLIC.GOOGLE_OAUTH_CLIENT_ID}&redirect_uri=${ENV_CONFIG_PUBLIC.ORIGIN}/auth/callback/google&response_type=code&scope=email%20profile&access_type=offline`;

export const SEARCH_QUERY_SEPARATOR = '|';

export const LOCAL_STORAGE_LAST_VIEWED_RECIPES_KEY = 'lastViewedRecipes';

export const SESSION_COOKIE_NAME = 'session';

/**
 * Maximum number of tag suggestions allowed per recipe creation session.
 * There is a rate limit on the route, but as it is currently designed, it would redirect the user
 * to the error page (which is not desired from a form) and there is really not a good way to prevent it
 * from here (unless the apiClient is reworked, which i did not want to do when writing this). This allows
 * to bypass that mechanic, and also give user feedback about remaining attempts.
 */
export const MAX_SUGGESTIONS = 10;
