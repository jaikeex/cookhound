import * as React from 'react';
import { useRecipeContext } from 'features/ViewRecipe/context';
import placeholder from 'assets/placeholder.png';

export interface RecipeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const RecipeImage: React.FC<RecipeImageProps> = (props): JSX.Element => {
  const { recipe } = useRecipeContext();

  return (
    <img
      {...props}
      style={{
        width: '100%',
        objectFit: 'contain'
      }}
      src={recipe.picturePath || placeholder}
      alt="recipe-image"
    />
  );
};

export default RecipeImage;
