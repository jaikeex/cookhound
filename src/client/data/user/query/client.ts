import { useAppQuery, useAppMutation } from '@/client/data/queryFactories';
import { useRepositories } from '@/client/data';
import {
    USER_QUERY_KEYS,
    type CancelAccountDeletionOptions,
    type ConfirmEmailChangeOptions,
    type CreateUserCookieConsentOptions,
    type CreateUserOptions,
    type DeleteShoppingListOptions,
    type GetUserByIdOptions,
    type InitiateAccountDeletionOptions,
    type InitiateEmailChangeOptions,
    type LastViewedRecipesOptions,
    type ResendVerificationEmailOptions,
    type ResetPasswordOptions,
    type SendResetPasswordEmailOptions,
    type ShoppingListOptions,
    type UpdateShoppingListOptions,
    type UpdateUserByIdOptions,
    type UpdateUserPreferencesOptions,
    type UpsertShoppingListOptions,
    type VerifyEmailOptions
} from './keys';

export const userQueryClient = {
    useCreateUser: (options?: Partial<CreateUserOptions>) => {
        const { userRepository } = useRepositories();

        return useAppMutation(
            (input) => userRepository.create({ input }),
            options
        );
    },

    useGetUserById: (userId: number, options?: Partial<GetUserByIdOptions>) => {
        const { userRepository } = useRepositories();

        return useAppQuery(
            USER_QUERY_KEYS.userById(userId),
            ({ signal }) => userRepository.getById({ id: userId, signal }),
            { enabled: !!userId, ...options }
        );
    },

    useShoppingList: (
        userId: number,
        options?: Partial<ShoppingListOptions>
    ) => {
        const { userRepository } = useRepositories();

        return useAppQuery(
            USER_QUERY_KEYS.shoppingList(userId),
            ({ signal }) =>
                userRepository.getShoppingList({ id: userId, signal }),
            {
                enabled: !!userId,
                retry: 1,
                ...options
            }
        );
    },

    useUpsertShoppingList: (
        userId: number,
        options?: Partial<UpsertShoppingListOptions>
    ) => {
        const { userRepository } = useRepositories();

        return useAppMutation(
            (data) => userRepository.upsertShoppingList({ id: userId, data }),
            options
        );
    },

    useUpdateShoppingList: (
        userId: number,
        options?: Partial<UpdateShoppingListOptions>
    ) => {
        const { userRepository } = useRepositories();

        return useAppMutation(
            (data) => userRepository.updateShoppingList({ id: userId, data }),
            options
        );
    },

    useDeleteShoppingList: (
        userId: number,
        options?: Partial<DeleteShoppingListOptions>
    ) => {
        const { userRepository } = useRepositories();

        return useAppMutation(
            (data) => userRepository.deleteShoppingList({ id: userId, data }),
            options
        );
    },

    useLastViewedRecipes: (
        userId: number,
        options?: Partial<LastViewedRecipesOptions>
    ) => {
        const { userRepository } = useRepositories();

        return useAppQuery(
            USER_QUERY_KEYS.lastViewedRecipes(userId),
            ({ signal }) =>
                userRepository.getLastViewedRecipes({ id: userId, signal }),
            {
                enabled: !!userId,
                retry: 1,
                ...options
            }
        );
    },

    useUpdateUserById: (options?: Partial<UpdateUserByIdOptions>) => {
        const { userRepository } = useRepositories();

        return useAppMutation(
            ({ userId, data }) =>
                userRepository.update({ id: userId, patch: data }),
            options
        );
    },

    useCreateUserCookieConsent: (
        options?: Partial<CreateUserCookieConsentOptions>
    ) => {
        const { userRepository } = useRepositories();

        return useAppMutation(
            (input) => userRepository.createCookieConsent({ input }),
            options
        );
    },

    useInitiateEmailChange: (options?: Partial<InitiateEmailChangeOptions>) => {
        const { userRepository } = useRepositories();

        return useAppMutation(
            (args) => userRepository.initiateEmailChange(args),
            options
        );
    },

    useConfirmEmailChange: (options?: Partial<ConfirmEmailChangeOptions>) => {
        const { userRepository } = useRepositories();

        return useAppMutation(
            (token) => userRepository.confirmEmailChange({ token }),
            options
        );
    },

    useUpdateUserPreferences: (
        options?: Partial<UpdateUserPreferencesOptions>
    ) => {
        const { userRepository } = useRepositories();

        return useAppMutation(
            ({ userId, data }) =>
                userRepository.updatePreferences({ id: userId, data }),
            options
        );
    },

    useVerifyEmail: (options?: Partial<VerifyEmailOptions>) => {
        const { userRepository } = useRepositories();

        return useAppMutation(
            (token) => userRepository.verifyEmail({ token }),
            options
        );
    },

    useResendVerificationEmail: (
        options?: Partial<ResendVerificationEmailOptions>
    ) => {
        const { userRepository } = useRepositories();

        return useAppMutation(
            (email) => userRepository.resendVerificationEmail({ email }),
            options
        );
    },

    useSendResetPasswordEmail: (
        options?: Partial<SendResetPasswordEmailOptions>
    ) => {
        const { userRepository } = useRepositories();

        return useAppMutation(
            (input) => userRepository.sendResetPasswordEmail({ input }),
            options
        );
    },

    useResetPassword: (options?: Partial<ResetPasswordOptions>) => {
        const { userRepository } = useRepositories();

        return useAppMutation(
            (input) => userRepository.resetPassword({ input }),
            options
        );
    },

    useInitiateAccountDeletion: (
        options?: Partial<InitiateAccountDeletionOptions>
    ) => {
        const { userRepository } = useRepositories();

        return useAppMutation(
            (input) => userRepository.initiateAccountDeletion({ input }),
            options
        );
    },

    useCancelAccountDeletion: (
        options?: Partial<CancelAccountDeletionOptions>
    ) => {
        const { userRepository } = useRepositories();

        return useAppMutation(
            () => userRepository.cancelAccountDeletion(),
            options
        );
    }
};
