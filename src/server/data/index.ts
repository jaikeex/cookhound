import 'server-only';
import { userServerData } from './user/server';
import { recipeServerData } from './recipe/server';
import { hubServerData } from './hub/server';

export const serverData = {
    user: userServerData,
    recipe: recipeServerData,
    hub: hubServerData
};
