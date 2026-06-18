import 'server-only';
import { cookies } from 'next/headers';
import { RequestContext } from '@/server/utils/reqwest/context';

type CookieStore = Awaited<ReturnType<typeof cookies>>;

// The store methods that mutate and therefore throw during an RSC render.
const MUTATION_METHODS = new Set<PropertyKey>(['set', 'delete', 'clear']);

//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                        PRECONDITION                                         §//
///
//§ This is NOT a blanket "safe to mutate cookies anywhere in a render" helper.
//§ The render no-op only engages when a RequestContext with origin 'render' is active.
//§ When NO context is active, getOrigin() defaults to 'route' and the REAL store is returned.
//§
//§ This default is deliberate and load-bearing: server actions carry no context
//§ yet must be allowed to mutate, so "no context = route = mutations apply" is exactly what
//§ keeps them working.
//§
//§ The consequence: calling this from a plain RSC render that did NOT establish
//§ a context falls through to the real store, and the subsequent set/delete
//§ throws the very Next.js error this helper exists to avoid. That throw is
//§ loud and immediate (good), but it means the safety only holds for route or
//§ action origins and for renders wrapped in ensureRenderContext; not for arbitrary
//§ render code. Mutate cookies only from those places.
///
//§—————————————————————————————————————————————————————————————————————————————————————————————§//

/**
 * Return the request's cookie store with its mutating methods guaranteed safe to call.
 *
 * Next.js throws if cookies().set/delete/clear is called during an rsc
 * render. Instead of every call site repeating an origin check, the guard exists:
 *
 * - On a route origin, the real store is returned untouched and mutations apply.
 * - On a render origin, a proxy is returned whose mutating methods are
 *   chainable no-ops while reads stay live. The stale value is reconciled on
 *   the next route-origin request.
 */
export async function mutableCookies(): Promise<CookieStore> {
    const store = await cookies();

    if (RequestContext.getOrigin() !== 'render') {
        return store;
    }

    return new Proxy(store, {
        get(target, prop, receiver) {
            if (MUTATION_METHODS.has(prop)) {
                return () => receiver;
            }

            const value = Reflect.get(target, prop, target);

            return typeof value === 'function' ? value.bind(target) : value;
        }
    });
}
