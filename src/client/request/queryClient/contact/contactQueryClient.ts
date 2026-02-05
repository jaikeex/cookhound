import { useAppMutation } from '@/client/request/queryClient/queryFactories';
import apiClient from '@/client/request/apiClient';
import type { SubmitContactFormOptions } from './types';

// This is fine (not a component, just declarations here).
/* eslint-disable react-hooks/rules-of-hooks */

class ContactQueryClient {
    /** Submits a contact form. */
    useSubmitContactForm = (options?: Partial<SubmitContactFormOptions>) =>
        useAppMutation(apiClient.contact.submitContactForm, options);
}

export const contactQueryClient = new ContactQueryClient();
