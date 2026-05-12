import { authRepositoryAdapter } from './auth';
import { ingredientRepositoryAdapter } from './ingredient';
import { recipeRepositoryAdapter } from './recipe';
import { userRepositoryAdapter } from './user';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                       REPOSITORY LIST                                       ?//
///
//# This object serves as the centralized default list of used respoitory adapters.
//# Note that this object should not be updated except when adding a new domain. Each domain
//# exports exactly one adapter (and it chooses which one to use, as it can have mane adapters
//# implemented). Barreling the exports through here colocates them with the domains while
//# still allowing them not to be hardcoded into the provider itself for testability purposes.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

export const repositories = {
    authRepository: authRepositoryAdapter,
    ingredientRepository: ingredientRepositoryAdapter,
    recipeRepository: recipeRepositoryAdapter,
    userRepository: userRepositoryAdapter
};
