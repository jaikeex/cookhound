'use client';

import { contactApiClient } from '@/client/request/apiClient/contact';
import type { ContactRepository } from '@/client/data/contact/port';

/**
 * HTTP-backed implementation of {@link ContactRepository}.
 */
export const httpContactRepository: ContactRepository = {
    submit: (payload) => contactApiClient.submitContactForm(payload)
};
