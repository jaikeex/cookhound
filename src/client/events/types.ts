export enum Event {
    NOT_FOUND = 'not-found'
}

export interface AppEventMap {
    [Event.NOT_FOUND]: void;
}

export type EventKey = keyof AppEventMap;
export type EventPayload<K extends EventKey> = AppEventMap[K];
