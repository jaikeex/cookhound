// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: 'https://d3a545adb5d1b64bf6c32e202dc70246@o4509481470918661.ingest.de.sentry.io/4509481472098384',

    ignoreErrors: [],

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
