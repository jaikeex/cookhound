import ingredientModel from './ingredient/model';
import ratingModel from './rating/model';
import recipeModel from './recipe/model';
import shoppingListModel from './shopping-list/model';
import userModel from './user/model';

const dbModel = {
    ingredient: ingredientModel,
    rating: ratingModel,
    recipe: recipeModel,
    shoppingList: shoppingListModel,
    user: userModel
};

export default dbModel;
