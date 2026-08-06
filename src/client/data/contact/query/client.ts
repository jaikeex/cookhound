import { useAppMutation } from '@/client/data/queryFactories';
import { useRepositories } from '@/client/data/DataProvider';
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
