import { useAppMutation } from '@/client/request/queryClient/queryFactories';
import { useRepositories } from '@/client/data';
import type { SubmitContactFormOptions } from './keys';

export const contactQueryClient = {
    /**
     * Submits a contact form.
     */
    useSubmitContactForm: (options?: Partial<SubmitContactFormOptions>) => {
        const { contactRepository } = useRepositories();

        return useAppMutation(contactRepository.submit, options);
    }
};
