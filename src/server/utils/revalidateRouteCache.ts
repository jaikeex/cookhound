import { ENV_CONFIG_PRIVATE, ENV_CONFIG_PUBLIC } from '@/common/constants';

/**
 * Revalidates the cache for a specific route.
 * This must be called from the server.
 *
 * @param path - The path of the route to revalidate.
 */
export const revalidateRouteCache = async (path: string) => {
    const encodedPath = encodeURIComponent(path);
    const encodedToken = encodeURIComponent(
        ENV_CONFIG_PRIVATE.REVALIDATE_PATH_TOKEN
    );

    // Construct absolute URL (fetch requires absolute URLs on server-side)
    const baseUrl = ENV_CONFIG_PUBLIC.ORIGIN;
    const url = `${baseUrl}/api/revalidate?path=${encodedPath}&token=${encodedToken}`;

    const response = await fetch(url);

    return response.json();
};
