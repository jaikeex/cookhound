import { ENV_CONFIG_PUBLIC } from '@/common/constants/env';
import { ROUTES } from './routes';

//?=============================================================================================?//

export const VERSION = '1.3.10';

//?=============================================================================================?//

export const DEFAULT_LOCALE = 'cs';
export const SUPPORTED_LOCALES = ['cs'] as const;

export const GOOGLE_SIGNIN_REDIRECT_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${ENV_CONFIG_PUBLIC.GOOGLE_OAUTH_CLIENT_ID}&redirect_uri=${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.auth.callback.google}&response_type=code&scope=email%20profile&access_type=offline`;

export const SEARCH_QUERY_SEPARATOR = '|';

// Page size of every recipe discovery list (front page, search, profile).
export const RECIPE_DISCOVERY_PER_PAGE = 24;

// id of the seeded system user that owns anonymized content after a real user is hard-deleted.
export const ANONYMOUS_USER_ID = -1;

export const SESSION_COOKIE_NAME = 'session';
export const SESSION_HINT_COOKIE_NAME = 'has_session';

export const OAUTH_STATE_KEY = 'oauth_state';

/**
 * Header carrying the revalidation secret on the worker → `/api/revalidate` self-call.
 */
export const REVALIDATE_TOKEN_HEADER = 'x-revalidate-token';

/**
 * Maximum number of tag suggestions allowed per recipe creation session.
 * There is a rate limit on the route, but as it is currently designed, it would redirect the user
 * to the error page (which is not desired from a form) and there is really not a good way to prevent it
 * from here (unless the apiClient is reworked, which i did not want to do when writing this). This allows
 * to bypass that mechanic, and also give user feedback about remaining attempts.
 */
export const MAX_SUGGESTIONS = 10;
