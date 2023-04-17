import { AddCircle, Delete } from '@mui/icons-material';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { CInput } from 'components/CInput';
import React from 'react';
import type { Ingredient } from 'core/types';

export interface IngredientsInputArrayProps {
  error?: boolean;
  handleChange: {
    (e: React.ChangeEvent<any>): void;
    <T = string | React.ChangeEvent<any>>(field: T): T extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };
  handleBlur: {
    (e: React.FocusEvent<any, Element>): void;
    <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void;
  };
  ingredients: Ingredient[];
  push: (obj: any) => void;
  remove: <T>(index: number) => T | undefined;
}

export const IngredientsInputArray: React.FC<IngredientsInputArrayProps> = ({
  error = false,
  handleChange,
  handleBlur,
  ingredients = [],
  push,
  remove
}): JSX.Element => {
  return (
    <Box p="2rem 1rem" border="1px solid green">
      <Typography variant="h4">Ingredients</Typography>
      {ingredients.map((ingredient, index) => (
        <Box key={index} display="flex" alignItems="center" gap="2rem" margin="3rem 0">
          <CInput
            name={`ingredients.${index}.amount`}
            label="Amount"
            size="small"
            autoComplete="off"
            value={ingredient.amount}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <CInput
            name={`ingredients.${index}.name`}
            label="Name"
            size="small"
            autoComplete="off"
            fullWidth
            value={ingredient.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={error}
          />
          <IconButton size="small" onClick={() => remove(index)}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ))}
      <Button fullWidth onClick={() => push({ name: '', amount: '' })} sx={{ alignSelf: 'flex-start' }}>
        <AddCircle />
      </Button>
    </Box>
  );
};