import 'server-only';
import { userServerData } from './user/server';
import { recipeServerData } from './recipe/server';

export const serverData = {
    user: userServerData,
    recipe: recipeServerData
};
