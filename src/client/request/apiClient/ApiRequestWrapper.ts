import { RequestError } from '@/client/error';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';

/**
 * A type alias for a URL string that must start with a forward slash.
 */
type UrlString = `/${string}`;

/**
 * The configuration object for an API request.
 */
export type RequestConfig = {
    /** The URL of the API endpoint. */
    url?: UrlString;
    /** The data to be sent in the request body. */
    data?: AnyObject | FormData;
    /** The URL parameters to be appended to the URL. Array values are appended as repeated keys. */
    params?: Record<
        string,
        string | number | boolean | undefined | (string | number | boolean)[]
    >;
    /** Optional custom headers for the request. */
    headers?: HeadersInit;
    /** Optional revalidation time for the request. */
    revalidate?: number;
    cache?: 'no-store' | 'force-cache' | 'only-if-cached';
    /** Optional AbortSignal so callers (e.g. react-query) can cancel in-flight requests. */
    signal?: AbortSignal;
};

/**
 * A singleton service class which provides methods to perform HTTP requests using the fetch API.
 * It's a wrapper around the native `fetch` API that adds common headers, error handling, and logging.
 */
class ApiRequestWrapper {
    private static instance: ApiRequestWrapper;
    private readonly API_URL = ENV_CONFIG_PUBLIC.API_URL;

    private constructor() {}

    /**
     * Gets the singleton instance of the ApiRequestWrapper.
     *
     * @returns The singleton instance.
     */
    public static getInstance(): ApiRequestWrapper {
        if (!ApiRequestWrapper.instance) {
            ApiRequestWrapper.instance = new ApiRequestWrapper();
        }
        return ApiRequestWrapper.instance;
    }

    /**
     * Performs a GET request.
     *
     * @template R - The type of the data to be returned in the response.
     * @param {RequestConfig} config - Configuration object including the URL, any data to be sent, and URL parameters.
     * @returns {Promise<R>} The body of the response as a promise.
     * @throws {RequestError} Throws a RequestError if the request fails.
     *
     * @example
     *  const response = await apiService.get<User>({
     *    url: '/user/current'
     *   });
     */
    async get<R>(config: RequestConfig): Promise<R> {
        return this.request<R>(config, 'GET');
    }

    /**
     * Performs a POST request.
     *
     * @template R - The type of the data to be returned in the response.
     * @param {RequestConfig} config - Configuration object including the URL, any data to be sent, and URL parameters.
     * @returns {Promise<R>} The body of the response as a promise.
     * @throws {RequestError} Throws a RequestError if the request fails.
     *
     * @example
     *  const response = await apiService.post<User>({
     *    url: '/user',
     *    data: {
     *      username: 'test',
     *      email: 'test@test.com',
     *      password: 'password'
     *    }
     *  });
     */
    async post<R>(config: RequestConfig): Promise<R> {
        return this.request<R>(config, 'POST');
    }

    /**
     * Performs a PUT request.
     *
     * @template R - The type of the data to be returned in the response.
     * @param {RequestConfig} config - Configuration object including the URL, any data to be sent, and URL parameters.
     * @returns {Promise<R>} The body of the response as a promise.
     * @throws {RequestError} Throws a RequestError if the request fails.
     *
     * @example
     *  const response = await apiService.put<User>({
     *    url: '/user',
     *    data: {
     *      username: 'test',
     *      email: 'test@test.com',
     *      password: 'password'
     *    }
     *  });
     */
    async put<R>(config: RequestConfig): Promise<R> {
        return this.request<R>(config, 'PUT');
    }

    /**
     * Performs a PATCH request.
     *
     * @template R - The type of the data to be returned in the response.
     * @param {RequestConfig} config - Configuration object including the URL, any data to be sent, and URL parameters.
     * @returns {Promise<R>} The body of the response as a promise.
     * @throws {RequestError} Throws a RequestError if the request fails.
     *
     * @example
     *  const response = await apiService.patch<User>({
     *    url: '/user',
     *    data: {
     *      username: 'test',
     *    }
     *  });
     */
    async patch<R>(config: RequestConfig): Promise<R> {
        return this.request<R>(config, 'PATCH');
    }

    /**
     * Performs a DELETE request.
     *
     * @template R - The type of the data to be returned in the response.
     * @param {RequestConfig} config - Configuration object including the URL, any data to be sent, and URL parameters.
     * @returns {Promise<R>} The body of the response as a promise.
     * @throws {RequestError} Throws a RequestError if the request fails.
     *
     * @example
     *  const response = await apiService.delete<User>({
     *    url: '/user/1'
     *  });
     */
    async delete<R>(config: RequestConfig): Promise<R> {
        return this.request<R>(config, 'DELETE');
    }

    /**
     * The core request method that all other request methods call.
     *
     * @template R - The type of the data to be returned in the response.
     * @param config - The request configuration.
     * @param method - The HTTP method to use.
     * @returns The body of the response as a promise.
     * @throws {RequestError} Throws a RequestError if the request fails.
     * @internal
     */
    private async request<R>(
        config: RequestConfig,
        method: string
    ): Promise<R> {
        if (!config.url) {
            throw new Error('URL is required');
        }

        let data: unknown;

        //?--------------------------------------------------------------?//
        //                       REQUEST CONSTRUCTION                     //
        //?--------------------------------------------------------------?//

        // Build headers: default to JSON unless FormData is being sent
        const defaultHeaders: HeadersInit = {};

        // Only set JSON content type when the payload is not FormData.
        if (!(config.data instanceof FormData)) {
            defaultHeaders['Content-Type'] = 'application/json';
        }

        const headers = new Headers({ ...defaultHeaders, ...config.headers });

        const options: RequestInit = {
            method,
            headers,
            credentials: 'include'
        };

        if (config.revalidate) {
            options.next = { revalidate: config.revalidate };
        }

        if (config.cache) {
            options.cache = config.cache;
        }

        if (config.signal) {
            options.signal = config.signal;
        }

        if (
            config.data &&
            (method === 'POST' ||
                method === 'PUT' ||
                method === 'PATCH' ||
                method === 'DELETE')
        ) {
            options.body =
                config.data instanceof FormData
                    ? (config.data as FormData)
                    : JSON.stringify(config.data);
        }

        const url = new URL(this.API_URL + config.url);
        if (config.params) {
            Object.entries(config.params).forEach(([key, value]) => {
                if (value === undefined) return;
                if (Array.isArray(value)) {
                    value.forEach((item) =>
                        url.searchParams.append(key, String(item))
                    );
                } else {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        //?—————————————————————————————————————————————————————————————————————————————————————?//
        //?                                 RESPONSE HANDLING                                   ?//
        ///
        //# Everything that leaves this method is a RequestError, so the error type the
        //# query layer declares (useAppQuery / useAppMutation) actually holds at runtime.
        //#
        //# A fetch() promise only rejects when no response arrives: a network error,
        //# CORS, a badly-formed URL, or an abort. It does not reject on HTTP error
        //# statuses (404, 504, ...), those are handled through response.ok below.
        //#
        //# Aborts are the one exception and are rethrown untouched. react-query aborts
        //# the signal on unmount / key change and recognizes the rejection as a
        //# cancellation; wrapping it would surface a cancelled query as a failure.
        ///
        //?—————————————————————————————————————————————————————————————————————————————————————?//

        let response: Response;

        try {
            response = await fetch(url.toString(), options);
        } catch (error: unknown) {
            if (config.signal?.aborted) {
                throw error;
            }

            throw RequestError.network(error);
        }

        try {
            data = await response.json();
        } catch (error: unknown) {
            data = null;
        }

        if (!response.ok) {
            throw RequestError.fromResponse(data, response);
        }

        return data as R;
    }
}

export const apiRequestWrapper = ApiRequestWrapper.getInstance();
