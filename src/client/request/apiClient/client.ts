import { userApiClient } from '@/client/request/apiClient/user/UserApiClient';
import { recipeApiClient } from '@/client/request/apiClient/recipe/RecipeApiClient';
import { authApiClient } from '@/client/request/apiClient/auth/AuthApiClient';
import { fileApiClient } from '@/client/request/apiClient/file/FileApiClient';
import { tagApiClient } from '@/client/request/apiClient/tag/TagApiClient';
import { cookbookApiClient } from '@/client/request/apiClient/cookbook/CookbookApiClient';
import { contactApiClient } from '@/client/request/apiClient/contact/ContactApiClient';
import { ingredientApiClient } from '@/client/request/apiClient/ingredient/IngredientApiClient';

/**
 * A centralized object that exports all the API client instances.
 * This allows for a single import point for all API services.
 */
const apiClient = {
    user: userApiClient,
    recipe: recipeApiClient,
    auth: authApiClient,
    file: fileApiClient,
    tag: tagApiClient,
    cookbook: cookbookApiClient,
    contact: contactApiClient,
    ingredient: ingredientApiClient
};

export default apiClient;
