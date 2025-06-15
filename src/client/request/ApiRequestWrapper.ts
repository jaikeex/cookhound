import { RequestError } from '@/client/error';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import { Logger } from '@/common/logger/console/logger';
import { redirect } from 'next/navigation';

/**
 * A type alias for a URL string that must start with a forward slash.
 */
type UrlString = `/${string}`;

/**
 * The configuration object for an API request.
 */
export type RequestConfig = {
    /** The URL of the API endpoint. */
    url: UrlString;
    /** The data to be sent in the request body. */
    data?: any;
    /** The URL parameters to be appended to the URL. */
    params?: any;
    /** Optional Next.js fetch request configuration. */
    next?: NextFetchRequestConfig;
    /** Optional custom headers for the request. */
    headers?: HeadersInit;
};

const logger = new Logger('ApiService');

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
        let data: any;
        const headers = new Headers({
            'Content-Type': 'application/json',
            ...config.headers
        }) as HeadersInit;

        const options: RequestInit = {
            method,
            headers,
            credentials: 'include',
            redirect: 'manual'
        };

        if (config.next) {
            options.next = config.next;
        }

        if (config.data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(config.data);
        }

        const url = new URL(this.API_URL + config.url);
        if (config.params) {
            Object.keys(config.params).forEach((key) =>
                url.searchParams.append(key, config.params[key])
            );
        }

        const response = await fetch(url.toString(), options);

        const isRedirect = response.status === 307 || response.status === 302;

        /**
         * Redirects need to be handled manually on the server side. I blame the
         * Next.js team for this.
         */
        if (isRedirect && typeof window === 'undefined') {
            const redirectUrl = response.headers.get('location');
            if (redirectUrl) {
                const url = new URL(redirectUrl, this.API_URL);
                const redirectPath = url.pathname + url.search;
                redirect(redirectPath);
            }
        }

        try {
            data = await response.json();
        } catch (err) {
            data = null;
        }

        if (!response.ok && !isRedirect) {
            logger.error('API %O', response.status, data);
            throw RequestError.fromFetchError(response, data);
        }

        return data;
    }
}

export const apiRequestWrapper = ApiRequestWrapper.getInstance();
