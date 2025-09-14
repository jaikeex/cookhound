export enum Event {
    NOT_FOUND_OPENED = 'not-found-opened',
    NOT_FOUND_CLOSED = 'not-found-closed'
}

export interface AppEventMap {
    [Event.NOT_FOUND_OPENED]: void;
    [Event.NOT_FOUND_CLOSED]: void;
}

export type EventKey = keyof AppEventMap;
export type EventPayload<K extends EventKey> = AppEventMap[K];
