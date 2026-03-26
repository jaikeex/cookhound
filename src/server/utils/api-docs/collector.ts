import { z } from 'zod';
import type {
    HttpMethod,
    ResponseDoc,
    RouteDocs,
    SerializedEndpointDoc,
    SerializedResponseDoc,
    SerializedRouteDoc
} from '@/common/types';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                       HOW THIS WORKS                                        ?//
///
//# This module is the entry point for the in-house API documentation system.
//# I did not want to create separate readme for this, and this file seemed like the best
//# place to put a detailed explanation of how the system works.
//#
//# There are four main parts:
//# (1) - Type definitions:
//#      - Authoring types that route files use to define their documentation.
//#        These types can reference live Zod schemas for request validation.
//#      - Serialized types that are sent to the client.
//#        These replace Zod schemas with plain JSON Schema objects.
//#
//# (2) - Registry:
//#      A module-level map that stores the documentation metadata registered by route files.
//#      Because of node module caching, every route file writes to the same map instance.
//#
//# (3) - Route files:
//#      Each route file calls a registration function at the top level.
//#      The Zod schemas used for validation are passed directly to the registration function.
//#
//# (4) - Collector:
//#      This module imports every route file, which triggers all the registration calls.
//#      Then it iterates over the registry, converts Zod schemas to JSON Schema,
//#      and returns a sorted array of plain objects.
//#
//# Response schemas are defined in a separate file because they are only used
//# for documentation and not at runtime, so they don't need to be full Zod schemas.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

//|---------------------------------------------------------------------------------|//
//?                                      AUTH                                       ?//
//|---------------------------------------------------------------------------------|//

import '@/app/api/auth/login/route';
import '@/app/api/auth/logout/route';
import '@/app/api/auth/logout-all/route';
import '@/app/api/auth/current/route';
import '@/app/api/auth/google/route';

//|---------------------------------------------------------------------------------|//
//?                                      USERS                                      ?//
//|---------------------------------------------------------------------------------|//

import '@/app/api/users/route';
import '@/app/api/users/[id]/route';
import '@/app/api/users/[id]/preferences/route';
import '@/app/api/users/[id]/shopping-list/route';
import '@/app/api/users/[id]/last-viewed/route';
import '@/app/api/users/me/email/route';
import '@/app/api/users/me/delete/route';
import '@/app/api/users/me/cookie-consent/route';
import '@/app/api/users/me/cookie-consent/[id]/verify/route';
import '@/app/api/users/me/terms-acceptance/[id]/verify/route';
import '@/app/api/users/reset-password/route';
import '@/app/api/users/verify-email/route';

//|---------------------------------------------------------------------------------|//
//?                                     RECIPES                                     ?//
//|---------------------------------------------------------------------------------|//

import '@/app/api/recipes/route';
import '@/app/api/recipes/[id]/route';
import '@/app/api/recipes/[id]/ratings/route';
import '@/app/api/recipes/[id]/visits/route';
import '@/app/api/recipes/display/[displayId]/route';
import '@/app/api/recipes/search/route';
import '@/app/api/recipes/filter/route';
import '@/app/api/recipes/tags/route';
import '@/app/api/recipes/tags/suggestions/route';
import '@/app/api/recipes/user/[userId]/route';
import '@/app/api/recipes/user/[userId]/search/route';

//|---------------------------------------------------------------------------------|//
//?                                    COOKBOOKS                                    ?//
//|---------------------------------------------------------------------------------|//

import '@/app/api/cookbooks/route';
import '@/app/api/cookbooks/[id]/route';
import '@/app/api/cookbooks/[id]/recipe/route';
import '@/app/api/cookbooks/display/[displayId]/route';
import '@/app/api/cookbooks/me/route';
import '@/app/api/cookbooks/user/[userId]/route';

//|---------------------------------------------------------------------------------|//
//?                                      ADMIN                                      ?//
//|---------------------------------------------------------------------------------|//

import '@/app/api/admin/stats/route';
import '@/app/api/admin/users/route';
import '@/app/api/admin/users/[userId]/route';
import '@/app/api/admin/users/[userId]/role/route';
import '@/app/api/admin/users/[userId]/status/route';
import '@/app/api/admin/users/[userId]/force-logout/route';
import '@/app/api/admin/users/[userId]/force-password-reset/route';
import '@/app/api/admin/users/[userId]/verify-email/route';
import '@/app/api/admin/users/[userId]/cancel-deletion/route';

//|---------------------------------------------------------------------------------|//
//?                                      OTHER                                      ?//
//|---------------------------------------------------------------------------------|//

import '@/app/api/contact/route';
import '@/app/api/file/avatar-img/route';
import '@/app/api/file/recipe-img/route';
import '@/app/api/ingredients/route';
import '@/app/api/revalidate/route';

//|---------------------------------------------------------------------------------|//
//?                                      TEST                                       ?//
//|---------------------------------------------------------------------------------|//

import '@/app/api/test/cleanup-user/route';
import '@/app/api/test/verify-user/route';

import { getRouteRegistry } from './registry';

//|=============================================================================================|//

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Converts a Zod schema to JSON Schema.
 */
function convertSchema(
    schema: z.ZodType | undefined
): Record<string, unknown> | undefined {
    if (!schema) return undefined;

    try {
        /**
         * Draft 7 produces the simplest, most predictable output for my use case i think.
         * It profives an output that is straightforward and predictable to traverse manually,
         * without $defs references or other indirections.
         */
        const jsonSchema = z.toJSONSchema(schema, {
            target: 'draft-7'
        });

        //This ensures plain objects. Important for serialization across the server/client boundary
        return JSON.parse(JSON.stringify(jsonSchema)) as Record<
            string,
            unknown
        >;
    } catch {
        return { _error: 'Schema conversion failed' };
    }
}

/**
 * Normalize and serialize response entries.
 * Strings are converted to { description } objects.
 * Object entries have their Zod schemas converted to JSON Schema.
 */
function serializeResponses(
    responses: Readonly<Record<number, ResponseDoc>>
): Record<number, SerializedResponseDoc> {
    const result: Record<number, SerializedResponseDoc> = {};

    for (const [status, doc] of Object.entries(responses)) {
        if (typeof doc === 'string') {
            result[Number(status)] = { description: doc };
        } else {
            result[Number(status)] = {
                description: doc.description,
                schema: convertSchema(doc.schema)
            };
        }
    }

    return result;
}

function processRouteDocs(path: string, docs: RouteDocs): SerializedRouteDoc {
    const endpoints: SerializedEndpointDoc[] = [];

    for (const method of HTTP_METHODS) {
        const methodDoc = docs[method];
        if (!methodDoc) continue;

        endpoints.push(
            JSON.parse(
                JSON.stringify({
                    method,
                    summary: methodDoc.summary,
                    description: methodDoc.description,
                    auth: methodDoc.auth,
                    rateLimit: methodDoc.rateLimit,
                    bodySchema: convertSchema(methodDoc.bodySchema),
                    querySchema: convertSchema(methodDoc.querySchema),
                    paramsSchema: convertSchema(methodDoc.paramsSchema),
                    requestContentType: methodDoc.requestContentType,
                    responses: serializeResponses(methodDoc.responses),
                    testOnly: methodDoc.testOnly,
                    captchaRequired: methodDoc.captchaRequired,
                    clientUsage: methodDoc.clientUsage
                })
            )
        );
    }

    return {
        path,
        category: docs.category,
        subcategory: docs.subcategory,
        endpoints
    };
}

/**
 * Collects and serializes API documentation from all route files.
 */
export function collectApiDocs(): SerializedRouteDoc[] {
    const registry = getRouteRegistry();

    return [...registry.entries()]
        .map(([path, docs]) => processRouteDocs(path, docs))
        .sort(
            (a, b) =>
                a.category.localeCompare(b.category) ||
                (a.subcategory ?? '').localeCompare(b.subcategory ?? '') ||
                a.path.localeCompare(b.path)
        );
}
