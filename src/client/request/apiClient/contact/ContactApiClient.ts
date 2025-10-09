import type { RequestConfig } from '@/client/request/apiClient/ApiRequestWrapper';
import { apiRequestWrapper } from '@/client/request/apiClient/ApiRequestWrapper';
import type { ContactFormData } from '@/common/types';

/**
 * Service for contact form operations.
 */
class ContactApiClient {
    /**
     * Submits a contact form by calling `POST /contact`.
     *
     * @param data - The contact form data (name, email, subject, message).
     * @param config - The fetch request configuration.
     *
     * @returns {Promise<{ success: boolean }>} A success response.
     * - 200: Success, message sent.
     *
     * @throws {Error} Throws an error if the request fails.
     * - 400: Bad Request, if validation fails.
     * - 429: Too Many Requests, if rate limit exceeded.
     * - 500: Internal Server Error, if email sending fails.
     */
    async submitContactForm(
        data: ContactFormData,
        config?: RequestConfig
    ): Promise<{ success: boolean }> {
        return await apiRequestWrapper.post<{ success: boolean }>({
            url: '/contact',
            data,
            ...config
        });
    }
}

export const contactApiClient = new ContactApiClient();
