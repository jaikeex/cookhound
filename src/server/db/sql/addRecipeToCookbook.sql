-- Safely append a recipe to the end of a cookbook
-- Parameters:
--   $1 :: int  – cookbookId
--   $2 :: int  – recipeId
--
-- 1. Lock the current tail row (if any) to prevent concurrent inserts that would race for the same
--    next position.  We avoid aggregates because `FOR UPDATE` is not allowed with them.
-- 2. Insert the link with position = locked.recipe_order + 1 (or 1 if the cookbook is empty).
-- 3. Return the new position.
WITH tail AS (
    SELECT recipe_order
    FROM cookbooks_recipes
    WHERE cookbook_id = $1
    ORDER BY recipe_order DESC
    LIMIT 1
    FOR UPDATE
), ins AS (
    INSERT INTO cookbooks_recipes (cookbook_id, recipe_id, recipe_order)
    VALUES (
        $1,
        $2,
        COALESCE((SELECT recipe_order FROM tail) + 1, 1)
    )
    RETURNING recipe_order
)
SELECT recipe_order FROM ins;
