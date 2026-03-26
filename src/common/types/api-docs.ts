import type { z } from 'zod';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export enum AuthLevel {
    PUBLIC = 'public',
    AUTHENTICATED = 'authenticated',
    ADMIN = 'admin',
    GUEST = 'anonymous-only'
}

export type RateLimitConfig = Readonly<{
    maxRequests: number;
    windowSizeInSeconds: number;
}>;

export type ResponseDoc =
    | string
    | Readonly<{
          description: string;
          schema?: z.ZodType;
      }>;

export type ClientUsageEntry = Readonly<{
    /** The apiClient method path, e.g. "apiClient.recipe.getRecipeList" */
    apiClient: string;
    /** The chqc hook path, e.g. "chqc.recipe.useRecipeList" */
    hook: string;
}>;

export type MethodDocs = Readonly<{
    /** Short one-line summary of what this handler does. */
    summary: string;
    /** Longer description (optional). */
    description?: string;
    /** Auth level required. */
    auth: AuthLevel;
    /** Rate limit config, if any. */
    rateLimit?: RateLimitConfig;
    /** Zod schema for the request body. */
    bodySchema?: z.ZodType;
    /** Zod schema for query string parameters. */
    querySchema?: z.ZodType;
    /** Zod schema for URL path parameters. */
    paramsSchema?: z.ZodType;
    /** Content type of the request body. */
    requestContentType?: string;
    /** HTTP status codes this handler can return, with descriptions. */
    responses: Readonly<Record<number, ResponseDoc>>;
    /** Whether this route is only available in test mode. */
    testOnly?: boolean;
    /** Whether this route requires a captcha token. */
    captchaRequired?: boolean;
    /** Client-side API client methods and react-query hooks that consume this endpoint. */
    clientUsage?: readonly ClientUsageEntry[];
}>;

/**
 * Documentation config exported from a route.ts file.
 * Keys are HTTP methods; values describe each handler.
 */
export type RouteDocs = Readonly<{
    category: string;
    subcategory?: string;
}> &
    Readonly<Partial<Record<HttpMethod, MethodDocs>>>;

export type SerializedResponseDoc = Readonly<{
    description: string;
    schema?: Record<string, unknown>;
}>;

export type SerializedEndpointDoc = Readonly<{
    method: HttpMethod;
    summary: string;
    description?: string;
    auth: AuthLevel;
    rateLimit?: RateLimitConfig;
    bodySchema?: Record<string, unknown>;
    querySchema?: Record<string, unknown>;
    paramsSchema?: Record<string, unknown>;
    requestContentType?: string;
    responses: Record<number, SerializedResponseDoc>;
    testOnly?: boolean;
    captchaRequired?: boolean;
    /** Client-side API client methods and react-query hooks that consume this endpoint. */
    clientUsage?: readonly ClientUsageEntry[];
}>;

export type SerializedRouteDoc = Readonly<{
    path: string;
    category: string;
    subcategory?: string;
    endpoints: SerializedEndpointDoc[];
}>;
