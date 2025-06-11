import { userApiClient } from '@/client/request/user/UserApiClient';
import { recipeApiClient } from '@/client/request/recipe/RecipeApiClient';
import { authApiClient } from '@/client/request/auth/AuthApiClient';
import { fileApiClient } from '@/client/request/file/FileApiClient';

/**
 * A centralized object that exports all the API client instances.
 * This allows for a single import point for all API services.
 */
const apiClient = {
    user: userApiClient,
    recipe: recipeApiClient,
    auth: authApiClient,
    file: fileApiClient
};

export default apiClient;
