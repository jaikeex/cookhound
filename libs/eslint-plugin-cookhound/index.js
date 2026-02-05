/* eslint-disable @typescript-eslint/no-require-imports */

const requireMakeHandler = require('./rules/require-make-handler');
const noRawRequestJson = require('./rules/no-raw-request-json');

module.exports = {
    rules: {
        'require-make-handler': requireMakeHandler,
        'no-raw-request-json': noRawRequestJson
    }
};
