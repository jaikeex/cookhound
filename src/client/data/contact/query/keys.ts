import type { UseMutationOptions } from '@tanstack/react-query';
import type { ContactFormPayload } from '@/common/types';
import type { RequestError } from '@/client/error';

//~---------------------------------------------------------------------------------------------~//
//$                                            KEYS                                             $//
//~---------------------------------------------------------------------------------------------~//

const CONTACT_NAMESPACE_QUERY_KEY = 'contact';

export const CONTACT_QUERY_KEYS = Object.freeze({
    namespace: CONTACT_NAMESPACE_QUERY_KEY
});

//~---------------------------------------------------------------------------------------------~//
//$                                          TYPES                                              $//
//~---------------------------------------------------------------------------------------------~//

export type SubmitContactFormOptions = Omit<
    UseMutationOptions<{ success: boolean }, RequestError, ContactFormPayload>,
    'mutationFn'
>;
