import type { AppEventMap } from './types';
import { EventBus } from './EventBus';

export const eventBus = new EventBus<AppEventMap & Record<string, unknown>>();

export * from './EventBus';
export * from './types';
