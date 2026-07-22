-- Search recipes by text across multiple fields
-- Parameters:
--   $1 :: text   – searchTerm (search query for title, description, notes, ingredients, and instructions)
--   $2 :: int    – limit (maximum number of recipes to return)
--   $3 :: int    – offset (number of recipes to skip)
--
-- Performs case-insensitive search across recipe title, description, notes, ingredient names, and instructions.
-- Excludes recipes with active flags.
SELECT
    DISTINCT r.id,
    r.display_id AS "displayId",
    r.title,
    r.image_url AS "imageUrl",
    r.rating,
    r.times_rated AS "timesRated",
    r.time,
    r.portion_size AS "portionSize",
    r.created_at AS "createdAt"
FROM
    recipes r
/*--------------------------------------------------------------------------------------------------*/
LEFT JOIN recipes_ingredients ri ON ri.recipe_id = r.id
LEFT JOIN ingredients i ON i.id = ri.ingredient_id
LEFT JOIN instructions instr ON instr.recipe_id = r.id
LEFT JOIN recipe_flags rf ON rf.recipe_id = r.id AND rf.active = true
/*--------------------------------------------------------------------------------------------------*/
WHERE
    rf.recipe_id IS NULL
    AND (
        r.title ILIKE '%' || $1 || '%'
        OR r.description ILIKE '%' || $1 || '%'
        OR r.notes ILIKE '%' || $1 || '%'
        OR i.name ILIKE '%' || $1 || '%'
        OR instr.text ILIKE '%' || $1 || '%'
    )
ORDER BY
    r.rating DESC NULLS LAST,
    r.created_at DESC
LIMIT $2 OFFSET $3;
