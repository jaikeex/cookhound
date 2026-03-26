import type { RouteDocs } from '@/common/types';

const registry = new Map<string, RouteDocs>();

/**
 * Register API documentation for a route.
 *
 * @param path - The API path (e.g., '/api/recipes/{id}')
 * @param docs - Route documentation metadata
 */
export function registerRouteDocs(path: string, docs: RouteDocs): void {
    registry.set(path, docs);
}

/**
 * Returns all registered route docs.
 */
export function getRouteRegistry(): Map<string, RouteDocs> {
    return registry;
}
