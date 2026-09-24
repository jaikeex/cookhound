/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('node:path');

// Mutating methods on the next/headers cookie store. All cookie mutation must
// go through setCookie()/deleteCookie() so cookie attributes stay centralized.
const MUTATION_METHODS = new Set(['set', 'delete', 'clear']);

// The single module allowed to wrap cookies() and expose the mutation helpers.
const isAccessorModule = (filename = '') => {
    const normalized = path.normalize(filename).split(path.sep).join('/');
    return normalized.endsWith('src/server/utils/reqwest/cookies.ts');
};

const unwrapAwait = (node) =>
    node && node.type === 'AwaitExpression' ? node.argument : node;

const rule = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Disallow mutating the next/headers cookies() store directly. Use setCookie()/deleteCookie() so cookie attributes (path/secure/domain) stay centralized in one place.',
            recommended: 'error'
        },
        messages: {
            noRawCookieMutation:
                'Do not call .{{method}}() on the next/headers cookies() store directly. Use setCookie()/deleteCookie() from @/server/utils/reqwest/cookies so the shared cookie attributes are applied in one place.'
        },
        schema: []
    },
    create(context) {
        const filename = context.filename;

        if (isAccessorModule(filename)) {
            return {};
        }

        // Local name `cookies` is imported under from next/headers (may be aliased).
        let cookiesImportName = null;
        // Variables known to hold a cookies() store (`const c = await cookies()`).
        const cookieStoreVars = new Set();

        const isCookiesCall = (node) =>
            node &&
            node.type === 'CallExpression' &&
            node.callee.type === 'Identifier' &&
            cookiesImportName !== null &&
            node.callee.name === cookiesImportName;

        return {
            ImportDeclaration(node) {
                if (node.source.value !== 'next/headers') {
                    return;
                }

                for (const spec of node.specifiers) {
                    if (
                        spec.type === 'ImportSpecifier' &&
                        spec.imported.name === 'cookies'
                    ) {
                        cookiesImportName = spec.local.name;
                    }
                }
            },

            VariableDeclarator(node) {
                if (!node.init || node.id.type !== 'Identifier') {
                    return;
                }

                if (isCookiesCall(unwrapAwait(node.init))) {
                    cookieStoreVars.add(node.id.name);
                }
            },

            CallExpression(node) {
                const callee = node.callee;

                if (
                    callee.type !== 'MemberExpression' ||
                    callee.property.type !== 'Identifier' ||
                    !MUTATION_METHODS.has(callee.property.name)
                ) {
                    return;
                }

                const target = unwrapAwait(callee.object);

                const mutatesCookieStore =
                    // const store = await cookies(); store.delete(...)
                    (target.type === 'Identifier' &&
                        cookieStoreVars.has(target.name)) ||
                    // (await cookies()).delete(...) / cookies().set(...)
                    isCookiesCall(target);

                if (mutatesCookieStore) {
                    context.report({
                        node: callee.property,
                        messageId: 'noRawCookieMutation',
                        data: { method: callee.property.name }
                    });
                }
            }
        };
    }
};

module.exports = rule;
