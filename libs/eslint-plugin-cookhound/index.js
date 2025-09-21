/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const requireMakeHandler = require('./rules/require-make-handler');
const noRawRequestJson = require('./rules/no-raw-request-json');

module.exports = {
    rules: {
        'require-make-handler': requireMakeHandler,
        'no-raw-request-json': noRawRequestJson
    }
};
