import type {
    AccountDeletionPayload,
    AccountDeletionResponse,
    DeleteShoppingListPayload,
    RecipeForDisplayDTO,
    ResetPasswordEmailPayload,
    ResetPasswordPayload,
    ShoppingListDTO,
    ShoppingListPayload,
    User,
    UserForCreatePayload,
    UserForUpdatePayload,
    UserPreferences
} from '@/common/types';
import type {
    CookieConsent,
    CookieConsentPayload
} from '@/common/types/cookie-consent';

/**
 * Domain port for user data access.
 */
export interface UserRepository {
    getById(args: { id: number; signal?: AbortSignal }): Promise<User>;

    create(args: { input: UserForCreatePayload }): Promise<User>;

    update(args: { id: number; patch: UserForUpdatePayload }): Promise<User>;

    getShoppingList(args: {
        id: number;
        signal?: AbortSignal;
    }): Promise<ShoppingListDTO[]>;

    upsertShoppingList(args: {
        id: number;
        data: ShoppingListPayload;
    }): Promise<ShoppingListDTO[]>;

    updateShoppingList(args: {
        id: number;
        data: ShoppingListPayload;
    }): Promise<ShoppingListDTO[]>;

    deleteShoppingList(args: {
        id: number;
        data: DeleteShoppingListPayload;
    }): Promise<void>;

    getLastViewedRecipes(args: {
        id: number;
        signal?: AbortSignal;
    }): Promise<RecipeForDisplayDTO[]>;

    createCookieConsent(args: {
        input: CookieConsentPayload;
    }): Promise<CookieConsent>;

    updatePreferences(args: {
        id: number;
        data: UserPreferences;
    }): Promise<void>;

    initiateEmailChange(args: {
        newEmail: string;
        password: string;
    }): Promise<void>;

    confirmEmailChange(args: { token: string }): Promise<User>;

    verifyEmail(args: { token: string }): Promise<void>;

    resendVerificationEmail(args: { email: string }): Promise<void>;

    sendResetPasswordEmail(args: {
        input: ResetPasswordEmailPayload;
    }): Promise<void>;

    resetPassword(args: { input: ResetPasswordPayload }): Promise<void>;

    initiateAccountDeletion(args: {
        input: AccountDeletionPayload;
    }): Promise<AccountDeletionResponse>;

    cancelAccountDeletion(): Promise<void>;
}
