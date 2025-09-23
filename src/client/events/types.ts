import type { UserDTO } from '@/common/types';
import type { CookieConsent } from '@/common/types/cookie-consent';

export enum AppEvent {
    NOT_FOUND_OPENED = 'not-found-opened',
    NOT_FOUND_CLOSED = 'not-found-closed',
    CONSENT_CHANGED = 'consent-changed',
    USER_LOGGED_IN = 'user-logged-in',
    USER_LOGGED_OUT = 'user-logged-out'
}

export interface AppEventMap {
    [AppEvent.NOT_FOUND_OPENED]: void;
    [AppEvent.NOT_FOUND_CLOSED]: void;
    [AppEvent.CONSENT_CHANGED]: CookieConsent | null;
    [AppEvent.USER_LOGGED_IN]: UserDTO;
    [AppEvent.USER_LOGGED_OUT]: void;
}

export type EventKey = keyof AppEventMap;
export type EventPayload<K extends EventKey> = AppEventMap[K];
