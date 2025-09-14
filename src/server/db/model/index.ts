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
    ingredient: ingredientModel,
    rating: ratingModel,
    recipe: recipeModel,
    shoppingList: shoppingListModel,
    recipeTag: recipeTagModel,
    user: userModel
};

export default dbModel;

//|---------------------------------------------------------------------------------------------|//
//?                                         PROJECTIONS                                         ?//
//|---------------------------------------------------------------------------------------------|//

import { USER_SELECT, getUserSelect } from './user/projections';

export { USER_SELECT, getUserSelect };
