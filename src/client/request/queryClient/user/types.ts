import type {
    UserDTO,
    UserForCreatePayload,
    ShoppingListDTO,
    ShoppingListPayload,
    DeleteShoppingListPayload,
    RecipeForDisplayDTO,
    ResetPasswordEmailPayload,
    ResetPasswordPayload,
    UserForUpdatePayload,
    UserPreferences,
    AccountDeletionPayload,
    AccountDeletionResponse
} from '@/common/types';
import type {
    CookieConsent,
    CookieConsentPayload
} from '@/common/types/cookie-consent';
import type {
    UseQueryOptions,
    UseMutationOptions
} from '@tanstack/react-query';
import type { RequestError } from '@/client/error';

//~---------------------------------------------------------------------------------------------~//
//$                                            KEYS                                             $//
//~---------------------------------------------------------------------------------------------~//

const USER_NAMESPACE_QUERY_KEY = 'user';

export const USER_QUERY_KEYS = Object.freeze({
    namespace: USER_NAMESPACE_QUERY_KEY,
    userById: (userId: number) =>
        [USER_NAMESPACE_QUERY_KEY, userId, 'user-by-id'] as const,
    shoppingList: (userId: number) =>
        [USER_NAMESPACE_QUERY_KEY, userId, 'shopping-list'] as const,
    lastViewedRecipes: (userId: number) =>
        [USER_NAMESPACE_QUERY_KEY, userId, 'last-viewed'] as const
});

//~---------------------------------------------------------------------------------------------~//
//$                                         TYPES                                              $//
//~---------------------------------------------------------------------------------------------~//

export type ShoppingListOptions = Omit<
    UseQueryOptions<
        ShoppingListDTO[],
        RequestError,
        ShoppingListDTO[],
        ReturnType<typeof USER_QUERY_KEYS.shoppingList>
    >,
    'queryKey' | 'queryFn'
>;

export type LastViewedRecipesOptions = Omit<
    UseQueryOptions<
        RecipeForDisplayDTO[],
        RequestError,
        RecipeForDisplayDTO[],
        ReturnType<typeof USER_QUERY_KEYS.lastViewedRecipes>
    >,
    'queryKey' | 'queryFn'
>;

export type CreateUserOptions = Omit<
    UseMutationOptions<UserDTO, RequestError, UserForCreatePayload>,
    'mutationFn'
>;

export type GetUserByIdOptions = Omit<
    UseQueryOptions<
        UserDTO,
        RequestError,
        UserDTO,
        ReturnType<typeof USER_QUERY_KEYS.userById>
    >,
    'queryKey' | 'queryFn'
>;

export type UpsertShoppingListOptions = Omit<
    UseMutationOptions<ShoppingListDTO[], RequestError, ShoppingListPayload>,
    'mutationFn'
>;

export type UpdateShoppingListOptions = Omit<
    UseMutationOptions<ShoppingListDTO[], RequestError, ShoppingListPayload>,
    'mutationFn'
>;

export type DeleteShoppingListOptions = Omit<
    UseMutationOptions<void, RequestError, DeleteShoppingListPayload>,
    'mutationFn'
>;

export type UpdateUserByIdOptions = Omit<
    UseMutationOptions<
        UserDTO,
        RequestError,
        { userId: number; data: UserForUpdatePayload }
    >,
    'mutationFn'
>;

export type CreateUserCookieConsentOptions = Omit<
    UseMutationOptions<CookieConsent, RequestError, CookieConsentPayload>,
    'mutationFn'
>;

export type InitiateEmailChangeOptions = Omit<
    UseMutationOptions<
        void,
        RequestError,
        { newEmail: string; password: string }
    >,
    'mutationFn'
>;

export type ConfirmEmailChangeOptions = Omit<
    UseMutationOptions<UserDTO, RequestError, string>,
    'mutationFn'
>;

export type UpdateUserPreferencesOptions = Omit<
    UseMutationOptions<
        void,
        RequestError,
        { userId: number; data: UserPreferences }
    >,
    'mutationFn'
>;

export type VerifyEmailOptions = Omit<
    UseMutationOptions<void, RequestError, string>,
    'mutationFn'
>;

export type ResendVerificationEmailOptions = Omit<
    UseMutationOptions<void, RequestError, string>,
    'mutationFn'
>;

export type SendResetPasswordEmailOptions = Omit<
    UseMutationOptions<void, RequestError, ResetPasswordEmailPayload>,
    'mutationFn'
>;

export type ResetPasswordOptions = Omit<
    UseMutationOptions<void, RequestError, ResetPasswordPayload>,
    'mutationFn'
>;

export type InitiateAccountDeletionOptions = Omit<
    UseMutationOptions<
        AccountDeletionResponse,
        RequestError,
        AccountDeletionPayload
    >,
    'mutationFn'
>;

export type CancelAccountDeletionOptions = Omit<
    UseMutationOptions<void, RequestError, undefined>,
    'mutationFn'
>;
