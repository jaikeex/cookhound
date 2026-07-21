import 'server-only';
import { userServerData } from './user/server';
import { recipeServerData } from './recipe/server';
import { hubServerData } from './hub/server';
import { adminServerData } from './admin/server';
import { cookbookServerData } from './cookbook/server';

export const serverData = {
    user: userServerData,
    recipe: recipeServerData,
    hub: hubServerData,
    admin: adminServerData,
    cookbook: cookbookServerData
};
