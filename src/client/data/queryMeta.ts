import type { RequestError } from '@/client/error';
import type { I18nMessage } from '@/client/locales';

/** Per-query error policy, read by the global handlers. */
export type AppQueryMeta = {
    silent?: boolean;
};

/** Per-mutation error policy, read by the global handlers. */
export type AppMutationMeta = {
    errorMessage?: I18nMessage | false;
    silent?: boolean;
};

declare module '@tanstack/react-query' {
    interface Register {
        defaultError: RequestError;
        queryMeta: AppQueryMeta;
        mutationMeta: AppMutationMeta;
    }
}
