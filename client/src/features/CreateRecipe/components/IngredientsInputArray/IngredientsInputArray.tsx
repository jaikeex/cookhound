import React, { useCallback } from 'react';
import { AddCircle, Delete } from '@mui/icons-material';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { CInput } from 'components';
import type { Ingredient } from 'types';

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
  const handleDeleteRowClick = useCallback((index: number) => () => remove(index), [remove]);

  const handleAddRow = useCallback(() => push({ name: '', amount: '' }), [push]);

  return (
    <Box p="2rem 0">
      <Typography color={error ? 'error' : 'default'} variant="h4">
        Ingredients *
      </Typography>
      {ingredients.map((ingredient, index) => (
        <Box key={index} display="flex" alignItems="center" gap="2rem" margin="2rem 0">
          <CInput
            name={`ingredients.${index}.amount`}
            label="Amount"
            data-testid={`ingredient-amount-${index}`}
            size="small"
            autoComplete="off"
            value={ingredient.amount}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <CInput
            name={`ingredients.${index}.unit`}
            label="Unit"
            data-testid={`ingredient-unit-${index}`}
            size="small"
            autoComplete="off"
            value={ingredient.unit}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <CInput
            name={`ingredients.${index}.name`}
            label="Name *"
            data-testid={`ingredient-name-${index}`}
            size="small"
            autoComplete="off"
            fullWidth
            value={ingredient.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={error}
          />
          <IconButton size="small" onClick={handleDeleteRowClick(index)} data-testid={`ingredient-delete-${index}`}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ))}
      <Button fullWidth onClick={handleAddRow} sx={{ alignSelf: 'flex-start' }} data-testid={`ingredient-add-button`}>
        <AddCircle />
      </Button>
    </Box>
  );
};
