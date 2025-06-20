import userModel from './user/userModel';
import recipeModel from './recipe/model';
import ratingModel from './rating/model';

const dbModel = {
    user: userModel,
    recipe: recipeModel,
    rating: ratingModel
};

export default dbModel;
