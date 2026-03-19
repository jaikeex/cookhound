import accountDeletionRequestModel from './account-deletion-request/model';
import adminActionLogModel from './admin-action-log/model';
import adminModel from './admin/model';
import cookbookModel from './cookbook/model';
import ingredientModel from './ingredient/model';
import ratingModel from './rating/model';
import recipeModel from './recipe/model';
import recipeTagModel from './recipe-tag/model';
import shoppingListModel from './shopping-list/model';
import userModel from './user/model';

//|---------------------------------------------------------------------------------------------|//
//?                                           MODELS                                            ?//
//|---------------------------------------------------------------------------------------------|//

const dbModel = {
    accountDeletionRequest: accountDeletionRequestModel,
    adminActionLog: adminActionLogModel,
    admin: adminModel,
    cookbook: cookbookModel,
    ingredient: ingredientModel,
    rating: ratingModel,
    recipe: recipeModel,
    recipeTag: recipeTagModel,
    shoppingList: shoppingListModel,
    user: userModel
};

export default dbModel;

//|---------------------------------------------------------------------------------------------|//
//?                                         PROJECTIONS                                         ?//
//|---------------------------------------------------------------------------------------------|//

import { USER_SELECT, getUserSelect } from './user/projections';

export { USER_SELECT, getUserSelect };
