import { userQueryClient, USER_QUERY_KEYS } from './user';
import { authQueryClient, AUTH_QUERY_KEYS } from './auth';
import { recipeQueryClient, RECIPE_QUERY_KEYS } from './recipe';
import { tagQueryClient, TAG_QUERY_KEYS } from './tag';
import { cookbookQueryClient, COOKBOOK_QUERY_KEYS } from './cookbook';
import { fileQueryClient } from './file';

/**
 * Unfortunately, this is the best name i came up with to differentiate it enought from the default
 * tanstack query client (which i want to call queryClient because it is the ultimate query client...)
 * and to not have it too long... It is not the best name, but it is A name.
 *
 * Stands for Cookhound Query Client.
 */
export const chqc = {
    user: userQueryClient,
    auth: authQueryClient,
    recipe: recipeQueryClient,
    tag: tagQueryClient,
    file: fileQueryClient,
    cookbook: cookbookQueryClient
};

export const QUERY_KEYS = {
    user: USER_QUERY_KEYS,
    auth: AUTH_QUERY_KEYS,
    recipe: RECIPE_QUERY_KEYS,
    tag: TAG_QUERY_KEYS,
    cookbook: COOKBOOK_QUERY_KEYS
};
