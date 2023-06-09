import * as React from 'react';
import parse from 'html-react-parser';
import { Typography } from '@mui/material';
import type { TypographyProps } from '@mui/material';
import { useRecipeContext } from 'features/ViewRecipe/context';

export interface RecipeInstructionsProps extends TypographyProps {}

const RecipeInstructions: React.FC<RecipeInstructionsProps> = (props): JSX.Element => {
  const { recipe } = useRecipeContext();

  return (
    <Typography {...props} variant="body2" data-testid="recipe-instructions">
      {parse(recipe.instructions.replace(/\n/g, '<br>'))}
    </Typography>
  );
};

export default RecipeInstructions;
