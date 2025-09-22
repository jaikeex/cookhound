import googleApiClient from './client';

export { googleApiClient };

// convenience re-export of configured Gmail service
export const gmailService = googleApiClient.getGmailService();

export * from './types';
