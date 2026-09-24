/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('node:path');

const isServiceFile = (filename = '') => {
    const normalized = path.normalize(filename).split(path.sep).join('/');
    return (
        normalized.includes('src/server/services/') &&
        normalized.endsWith('service.ts')
    );
};

/**
 * True when a class body declares static LOG_CONTEXT
 */
const hasStaticLogContext = (classBody) =>
    classBody.body.some(
        (member) =>
            member.type === 'PropertyDefinition' &&
            member.static === true &&
            member.key &&
            member.key.type === 'Identifier' &&
            member.key.name === 'LOG_CONTEXT'
    );

const rule = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Require service classes to declare a static LOG_CONTEXT so the @LogServiceMethod logger context survives production minification.',
            recommended: 'error'
        },
        messages: {
            missingLogContext:
                "Service class '{{name}}' must declare a 'static LOG_CONTEXT' string. @LogServiceMethod falls back to the class name, which the production bundler mangles to a single letter (e.g. 'z'), so without it the service logs under an unidentifiable context."
        },
        schema: []
    },
    create(context) {
        const filename = context.filename;

        if (!isServiceFile(filename)) {
            return {};
        }

        /**
         * Flag any class named *Service (the singleton convention) that lacks
         * the static field. Helper classes with other names are ignored, and an
         * anonymous class expression (no id) cannot match the convention so it
         * is skipped.
         */
        const check = (node) => {
            const name = node.id && node.id.name;

            if (!name || !name.endsWith('Service')) {
                return;
            }

            if (!hasStaticLogContext(node.body)) {
                context.report({
                    node: node.id,
                    messageId: 'missingLogContext',
                    data: { name }
                });
            }
        };

        return {
            ClassDeclaration: check,
            ClassExpression: check
        };
    }
};

module.exports = rule;
