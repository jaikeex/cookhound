-- Insert recipe into a cookbook at specific position P (1-based)
-- Parameters:
--   $1 :: int  – cookbookId
--   $2 :: int  – recipeId
--   $3 :: int  – position
--
-- Shifts trailing items and inserts new link atomically.  Returns the
-- position where the recipe was inserted.
WITH shift AS (
    UPDATE cookbooks_recipes
    SET    recipe_order = recipe_order + 1
    WHERE  cookbook_id  = $1
    AND    recipe_order >= $3
    RETURNING 1
), ins AS (
    INSERT INTO cookbooks_recipes (cookbook_id, recipe_id, recipe_order)
    VALUES ($1, $2, $3)
    RETURNING recipe_order
)
SELECT recipe_order AS "recipeOrder" FROM ins;
