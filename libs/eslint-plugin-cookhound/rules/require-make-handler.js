/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('node:path');

const isApiRouteFile = (filename = '') => {
    const normalized = path.normalize(filename).split(path.sep).join('/');
    return normalized.includes('src/app/api');
};

const requireMakeHandler = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Ensure Next.js API route exports use makeHandler factory instead of pipe() directly.',
            recommended: 'error'
        },
        messages: {
            useMakeHandler:
                'Use makeHandler() factory instead of pipe() for exported route handlers.'
        },
        schema: []
    },
    create(context) {
        const filename = context.getFilename();

        if (!isApiRouteFile(filename)) {
            return {};
        }

        return {
            // Detect: export const POST = pipe(...)(handler)
            ExportNamedDeclaration(node) {
                if (
                    node.declaration &&
                    node.declaration.type === 'VariableDeclaration'
                ) {
                    for (const decl of node.declaration.declarations) {
                        if (
                            decl.init &&
                            decl.init.type === 'CallExpression' &&
                            decl.init.callee.name === 'pipe'
                        ) {
                            context.report({
                                node: decl.init,
                                messageId: 'useMakeHandler'
                            });
                        }
                    }
                }
            },
            // Detect: export const POST = makeHandler(pipe(...)) -- should not error
            CallExpression(node) {
                const calleeName = node.callee.name;
                if (calleeName === 'pipe') {
                    // If ancestor chain includes makeHandler call, ignore
                    let parent = node.parent;
                    while (parent) {
                        if (
                            parent.type === 'CallExpression' &&
                            parent.callee.name === 'makeHandler'
                        ) {
                            return;
                        }
                        parent = parent.parent;
                    }
                    if (isApiRouteFile(filename)) {
                        context.report({ node, messageId: 'useMakeHandler' });
                    }
                }
            }
        };
    }
};

module.exports = requireMakeHandler;
