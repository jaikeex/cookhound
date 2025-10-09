import type { UseMutationOptions } from '@tanstack/react-query';
import type { ContactFormData } from '@/common/types';
import type { RequestError } from '@/client/error';

export type SubmitContactFormOptions = UseMutationOptions<
    { success: boolean },
    RequestError,
    ContactFormData
>;

export const CONTACT_QUERY_KEYS = {
    contact: 'contact'
} as const;
