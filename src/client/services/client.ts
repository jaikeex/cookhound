import { userApiClient } from '@/client/services/user/UserApiClient';
import { recipeApiClient } from '@/client/services/recipe/RecipeApiClient';
import { authApiClient } from '@/client/services/auth/AuthApiClient';
import { fileApiClient } from '@/client/services/file/FileApiClient';

const apiClient = {
    user: userApiClient,
    recipe: recipeApiClient,
    auth: authApiClient,
    file: fileApiClient
};

export default apiClient;
