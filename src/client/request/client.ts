import { userApiClient } from '@/client/request/user/UserApiClient';
import { recipeApiClient } from '@/client/request/recipe/RecipeApiClient';
import { authApiClient } from '@/client/request/auth/AuthApiClient';
import { fileApiClient } from '@/client/request/file/FileApiClient';

const apiClient = {
    user: userApiClient,
    recipe: recipeApiClient,
    auth: authApiClient,
    file: fileApiClient
};

export default apiClient;
