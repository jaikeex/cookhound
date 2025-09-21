/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('node:path');

const REQUEST_IDENTIFIERS = new Set(['request', 'req']);

const isApiRouteFile = (filename = '') => {
    const normalized = path.normalize(filename).split(path.sep).join('/');
    return normalized.includes('src/app/api');
};

const rule = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Disallow calling request.json() directly inside API route handlers. Use readJson() helper with size limit instead.',
            recommended: 'error'
        },
        messages: {
            noRawRequestJson:
                'Use readJson() helper instead of {{identifier}}.json() to enforce payload size limits.'
        },
        schema: []
    },
    create(context) {
        const filename = context.getFilename();

        if (!isApiRouteFile(filename)) {
            return {};
        }

        return {
            CallExpression(node) {
                /* Matches something like `request.json()` or `req.json()` */
                if (node.callee && node.callee.type === 'MemberExpression') {
                    const member = node.callee;
                    if (
                        member.property &&
                        member.property.type === 'Identifier' &&
                        member.property.name === 'json' &&
                        member.object &&
                        member.object.type === 'Identifier' &&
                        REQUEST_IDENTIFIERS.has(member.object.name)
                    ) {
                        context.report({
                            node: member,
                            messageId: 'noRawRequestJson',
                            data: { identifier: member.object.name }
                        });
                    }
                }
            }
        };
    }
};

module.exports = rule;
