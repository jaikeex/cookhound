import type { HttpMethod } from '@/common/types';

export const METHOD_COLORS: Record<
    HttpMethod,
    'primary' | 'secondary' | 'danger' | 'warning' | 'subtle'
> = {
    GET: 'primary',
    POST: 'secondary',
    PUT: 'warning',
    PATCH: 'warning',
    DELETE: 'danger'
};

export const AUTH_LABELS: Record<string, string> = {
    public: 'Public',
    authenticated: 'Auth',
    admin: 'Admin',
    'anonymous-only': 'Guests only'
};
