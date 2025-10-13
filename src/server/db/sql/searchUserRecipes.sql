-- Search recipes owned by a specific user across multiple fields
-- Parameters:
--   $1 :: int    – authorId (user ID of the recipe author)
--   $2 :: text   – language (recipe language filter)
--   $3 :: text   – searchTerm (search query for title, notes, ingredients, and instructions)
--   $4 :: int    – limit (maximum number of recipes to return)
--   $5 :: int    – offset (number of recipes to skip)
--
-- Performs case-insensitive search and includes active flags if present.
SELECT
    DISTINCT r.id,
    r.display_id AS "displayId",
    r.title,
    r.image_url AS "imageUrl",
    r.rating,
    r.times_rated AS "timesRated",
    r.time,
    r.portion_size AS "portionSize",
    r.created_at AS "createdAt",
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM recipe_flags rf_check 
            WHERE rf_check.recipe_id = r.id AND rf_check.active = true
        ) THEN (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', rf_flags.id,
                    'userId', rf_flags.user_id,
                    'reason', rf_flags.reason,
                    'resolved', rf_flags.resolved,
                    'active', rf_flags.active,
                    'resolvedAt', rf_flags.resolved_at,
                    'createdAt', rf_flags.created_at
                )
                ORDER BY rf_flags.created_at DESC
            )
            FROM recipe_flags rf_flags
            WHERE rf_flags.recipe_id = r.id AND rf_flags.active = true
        )
        ELSE NULL
    END AS flags
FROM
    recipes r
/*--------------------------------------------------------------------------------------------------*/
LEFT JOIN recipes_ingredients ri ON ri.recipe_id = r.id
LEFT JOIN ingredients i ON i.id = ri.ingredient_id
LEFT JOIN instructions instr ON instr.recipe_id = r.id
/*--------------------------------------------------------------------------------------------------*/
WHERE
    r.author_id = $1
    AND r.language = $2
    AND (
        r.title ILIKE '%' || $3 || '%'
        OR r.notes ILIKE '%' || $3 || '%'
        OR i.name ILIKE '%' || $3 || '%'
        OR instr.text ILIKE '%' || $3 || '%'
    )
ORDER BY
    r.created_at DESC
LIMIT $4 OFFSET $5;
