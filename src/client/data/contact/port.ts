import type { ContactFormPayload } from '@/common/types';

/**
 * Domain port for contact-form operations.
 */
export interface ContactRepository {
    /**
     * Submits a contact form payload.
     */
    submit(payload: ContactFormPayload): Promise<{ success: boolean }>;
}
