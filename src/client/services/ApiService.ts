import { RequestError } from '@/client/error';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';

type UrlString = `/${string}`;

export type RequestConfig = {
    url: UrlString;
    data?: any;
    params?: any;
    next?: NextFetchRequestConfig;
};

/**
 * Service class which provides methods to perform HTTP requests using the fetch api.
 * Implementations are provided for the following HTTP methods: get, post, put, and delete.
 */
class ApiService {
    private static instance: ApiService;
    private readonly API_URL = ENV_CONFIG_PUBLIC.API_URL;
    private readonly ENV = ENV_CONFIG_PUBLIC.ENV;

    private constructor() {}

    public static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    /**
     * Performs a GET request.
     *
     * @template R - The type of the data to be returned in the response.
     * @param {RequestConfig} config - Configuration object including the URL, any data to be sent, and URL parameters.
     * @returns {Promise<R>} The body of the response as a promise.
     * @throws {Error} Throws an error if the request fails.
     *
     * @example
     *  const response = await apiService.get<User>({
     *    url: '/user/current'
     *   });
     *
     *  console.log(response);
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
     * @throws {Error} Throws an error if the request fails.
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
     * @throws {Error} Throws an error if the request fails.
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
     * @throws {Error} Throws an error if the request fails.
     *
     * @example
     *  const response = await apiService.delete<User>({
     *    url: '/user/1'
     *  });
     */
    async delete<R>(config: RequestConfig): Promise<R> {
        return this.request<R>(config, 'DELETE');
    }

    private async request<R>(
        config: RequestConfig,
        method: string
    ): Promise<R> {
        let response: Response;
        let data: any;
        const headers = new Headers({
            'Content-Type': 'application/json'
        }) as HeadersInit;

        const options: RequestInit = {
            method,
            headers,
            credentials: 'include'
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

        try {
            response = await fetch(url.toString(), options);
        } catch (err) {
            this.ENV === 'development' && console.error('API %O', err);
            throw RequestError.fromFetchError(err);
        }

        try {
            data = await response.json();
        } catch (err) {
            data = null;
        }

        if (!response.ok) {
            this.ENV === 'development' &&
                console.error('API %O', response.status, data);
            throw new RequestError(
                response.status,
                data?.error || response.statusText
            );
        }

        return data;
    }
}

export const apiService = ApiService.getInstance();
