/**
 * Revalidates the cache for a specific route
 *
 * @param path - The path of the route to revalidate.
 */
export const revalidateRouteCache = async (path: string) => {
    const response = await fetch(`/api/revalidate?path=${path}`);

    if (!response.ok) {
        throw new Error('Failed to revalidate route cache');
    }

    return response.json();
};
