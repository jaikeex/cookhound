/* eslint-disable @typescript-eslint/no-require-imports */

const requireMakeHandler = require('./rules/require-make-handler');
const noRawRequestJson = require('./rules/no-raw-request-json');
const noRawCookieMutation = require('./rules/no-raw-cookie-mutation');

module.exports = {
    rules: {
        'require-make-handler': requireMakeHandler,
        'no-raw-request-json': noRawRequestJson,
        'no-raw-cookie-mutation': noRawCookieMutation
    }
};
