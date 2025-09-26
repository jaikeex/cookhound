-- Reorder all recipes inside a cookbook according to the provided array of IDs.
-- Parameters:
--   $1 :: int       – cookbookId
--   $2 :: int[]     – orderedRecipeIds (must contain every recipe in the cookbook)
--
-- The recipe_order becomes the 1-based index of recipe_id inside the array.
UPDATE cookbooks_recipes
SET    recipe_order = array_position($2::int[], recipe_id)
WHERE  cookbook_id = $1;
