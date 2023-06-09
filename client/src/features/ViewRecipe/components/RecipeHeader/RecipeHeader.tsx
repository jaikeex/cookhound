import React from 'react';
import { AccessTimeRounded, OutdoorGrillRounded } from '@mui/icons-material';
import { Typography, Divider, Box, useMediaQuery, useTheme } from '@mui/material';
import type { BoxProps } from '@mui/material';
import { FlexBetween, LikeButton, RecipeInfoTag, TextLink } from 'components';
import { useRecipeContext } from '@viewRecipe/context';
import { useSelector } from 'react-redux';
import type { RootState } from 'store';

export interface RecipeHeaderProps extends BoxProps {
  onLikeRecipe: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

const RecipeHeader: React.FC<RecipeHeaderProps> = ({ onLikeRecipe, ...props }): JSX.Element => {
  const { recipe } = useRecipeContext();
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const md = useMediaQuery(`(max-width:${theme.breakpoints.values.sm}px)`);

  return (
    <Box {...props}>
      <FlexBetween>
        <Typography variant="h1">{recipe.name}</Typography>
        <LikeButton
          defaultChecked={recipe.likedByUser}
          disabled={!user}
          onChange={onLikeRecipe}
          label={recipe.likesCount}
          labelPlacement="start"
          data-testid="recipe-like-button"
        />
      </FlexBetween>
      <Divider />
      <Box display="flex" gap="1rem" mt="0.375rem">
        <RecipeInfoTag icon={<AccessTimeRounded />} data-testid="recipe-info-cooking-time">
          <Typography variant="body2">{recipe.cookingTime} min.</Typography>
        </RecipeInfoTag>
        <RecipeInfoTag icon={<OutdoorGrillRounded />} data-testid="recipe-info-difficulty">
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {recipe.difficulty}
          </Typography>
        </RecipeInfoTag>
        <Box ml="auto" display="flex" gap="1.5rem" flexDirection={md ? 'column' : 'row'}>
          <TextLink to={`/profile/${recipe.user._id}`} variant="caption" data-testid="recipe-author-link">
            Author: {recipe.user.username}
          </TextLink>
          <Typography variant="caption">{new Date(+recipe.createdAt).toLocaleDateString()}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RecipeHeader;
