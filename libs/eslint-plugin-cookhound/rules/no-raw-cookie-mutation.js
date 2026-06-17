/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('node:path');

// Mutating methods on the next/headers cookie store. These throw during an RSC
// render; mutableCookies() turns them into no-ops there instead.
const MUTATION_METHODS = new Set(['set', 'delete', 'clear']);

// The single module allowed to wrap cookies() and expose a guarded store.
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
                'Disallow mutating the next/headers cookies() store directly. Use mutableCookies() so render-origin mutations are safely skipped instead of throwing.',
            recommended: 'error'
        },
        messages: {
            noRawCookieMutation:
                'Do not call .{{method}}() on the next/headers cookies() store directly. Use mutableCookies() from @/server/utils/reqwest/cookies so render-origin cookie mutations are skipped instead of throwing.'
        },
        schema: []
    },
    create(context) {
        const filename =
            typeof context.getFilename === 'function'
                ? context.getFilename()
                : context.filename;

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
