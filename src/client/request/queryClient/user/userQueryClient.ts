import {
    useAppQuery,
    useAppMutation
} from '@/client/request/queryClient/queryFactories';
import apiClient from '@/client/request/apiClient';
import type {
    ShoppingListOptions,
    LastViewedRecipesOptions,
    CreateUserOptions,
    UpsertShoppingListOptions,
    UpdateShoppingListOptions,
    DeleteShoppingListOptions,
    VerifyEmailOptions,
    ResendVerificationEmailOptions,
    SendResetPasswordEmailOptions,
    ResetPasswordOptions,
    GetUserByIdOptions,
    UpdateUserByIdOptions,
    CreateUserCookieConsentOptions,
    UpdateUserPreferencesOptions,
    InitiateEmailChangeOptions,
    ConfirmEmailChangeOptions,
    InitiateAccountDeletionOptions,
    CancelAccountDeletionOptions
} from './types';
import { USER_QUERY_KEYS } from './types';

class UserQueryClient {
    /**
     * Creates a new user.
     */
    useCreateUser = (options?: Partial<CreateUserOptions>) =>
        useAppMutation(apiClient.user.createUser, options);

    /**
     * Gets a user by their ID.
     */
    useGetUserById = (userId: number, options?: Partial<GetUserByIdOptions>) =>
        useAppQuery(
            USER_QUERY_KEYS.userById(userId),
            () => apiClient.user.getUserById(userId),
            { enabled: !!userId, ...options }
        );

    /**
     * Gets the shopping list for a user.
     *
     * Key: USER_QUERY_KEYS.shoppingList(userId)
     * Stale time: default
     * Retry: 1
     *
     * @param userId - The ID of the user.
     */
    useShoppingList = (
        userId: number,
        options?: Partial<ShoppingListOptions>
    ) =>
        useAppQuery(
            USER_QUERY_KEYS.shoppingList(userId),
            () => apiClient.user.getShoppingList(userId),
            {
                enabled: !!userId,
                retry: 1,
                ...options
            }
        );

    /**
     * Upserts the shopping list for a user.
     */
    useUpsertShoppingList = (
        userId: number,
        options?: Partial<UpsertShoppingListOptions>
    ) =>
        useAppMutation(
            (data) => apiClient.user.upsertShoppingList(userId, data),
            options
        );

    /**
     * Updates the shopping list for a user.
     */
    useUpdateShoppingList = (
        userId: number,
        options?: Partial<UpdateShoppingListOptions>
    ) =>
        useAppMutation(
            (data) => apiClient.user.updateShoppingList(userId, data),
            options
        );

    /**
     * Deletes the shopping list for a user.
     */
    useDeleteShoppingList = (
        userId: number,
        options?: Partial<DeleteShoppingListOptions>
    ) =>
        useAppMutation(
            (data) => apiClient.user.deleteShoppingList(userId, data),
            options
        );

    /**
     * Gets the last viewed recipes for a user.
     *
     * Key: USER_QUERY_KEYS.lastViewedRecipes(userId)
     * Stale time: default
     * Retry: 1
     *
     * @param userId - The ID of the user.
     */
    useLastViewedRecipes = (
        userId: number,
        options?: Partial<LastViewedRecipesOptions>
    ) =>
        useAppQuery(
            USER_QUERY_KEYS.lastViewedRecipes(userId),
            () => apiClient.user.getUserLastViewedRecipes(userId),
            {
                enabled: !!userId,
                retry: 1,
                ...options
            }
        );

    /**
     * Updates a user by their ID.
     */
    useUpdateUserById = (options?: Partial<UpdateUserByIdOptions>) =>
        useAppMutation(
            ({ userId, data }) => apiClient.user.updateUserById(userId, data),
            options
        );

    /**
     * Creates a user cookie consent.
     */
    useCreateUserCookieConsent = (
        options?: Partial<CreateUserCookieConsentOptions>
    ) => useAppMutation(apiClient.user.createUserCookieConsent, options);

    /**
     * Initiates an e-mail change.
     */
    useInitiateEmailChange = (options?: Partial<InitiateEmailChangeOptions>) =>
        useAppMutation(apiClient.user.initiateEmailChange, options);

    /**
     * Confirms an e-mail change.
     */
    useConfirmEmailChange = (options?: Partial<ConfirmEmailChangeOptions>) =>
        useAppMutation(apiClient.user.confirmEmailChange, options);

    /**
     * Updates a user's preferences.
     */
    useUpdateUserPreferences = (
        options?: Partial<UpdateUserPreferencesOptions>
    ) =>
        useAppMutation(
            ({ userId, data }) =>
                apiClient.user.updateUserPreferences(userId, data),
            options
        );

    /**
     * Verifies an email.
     */
    useVerifyEmail = (options?: Partial<VerifyEmailOptions>) =>
        useAppMutation(apiClient.user.verifyEmail, options);

    /**
     * Resends a verification email.
     */
    useResendVerificationEmail = (
        options?: Partial<ResendVerificationEmailOptions>
    ) => useAppMutation(apiClient.user.resendVerificationEmail, options);

    /**
     * Sends a reset password email.
     */
    useSendResetPasswordEmail = (
        options?: Partial<SendResetPasswordEmailOptions>
    ) => useAppMutation(apiClient.user.sendResetPasswordEmail, options);

    /**
     * Resets a password.
     */
    useResetPassword = (options?: Partial<ResetPasswordOptions>) =>
        useAppMutation(apiClient.user.resetPassword, options);

    /**
     * Initiates account deletion.
     */
    useInitiateAccountDeletion = (
        options?: Partial<InitiateAccountDeletionOptions>
    ) => useAppMutation(apiClient.user.initiateAccountDeletion, options);

    /**
     * Cancels account deletion.
     */
    useCancelAccountDeletion = (
        options?: Partial<CancelAccountDeletionOptions>
    ) => useAppMutation(() => apiClient.user.cancelAccountDeletion(), options);
}

export const userQueryClient = new UserQueryClient();
