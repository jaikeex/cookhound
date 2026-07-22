-- Fetch multiple recipes with full details including ingredients, instructions, flags, and tags
-- Parameters:
--   $1 :: int    – limit (maximum number of recipes to return)
--   $2 :: int    – offset (number of recipes to skip)
--
-- Returns complete recipe data with nested JSON aggregations for related entities.
-- Excludes recipes with active flags.
SELECT
    r.id,
    r.display_id AS "displayId",
    r.title,
    r.author_id AS "authorId",
    r.time,
    r.portion_size AS "portionSize",
    r.description,
    r.notes,
    r.image_url AS "imageUrl",
    r.rating,
    r.times_rated AS "timesRated",
    r.times_viewed AS "timesViewed",
    r.created_at AS "createdAt",
    r.updated_at AS "updatedAt",
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', i.id,
                'name', i.name,
                'quantity', ri.quantity,
                'category', ri.category,
                'categoryOrder', ri.category_order
            )
            ORDER BY COALESCE(ri.category_order, 0), ri.ingredient_order
        )
        FROM recipes_ingredients ri
        JOIN ingredients i ON ri.ingredient_id = i.id
        WHERE ri.recipe_id = r.id
    ) AS ingredients,
    (
        SELECT jsonb_agg(
            i.text
            ORDER BY i.step 
        )
        FROM instructions i
        WHERE i.recipe_id = r.id
    ) AS instructions,
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', rf.id,
                'userId', rf.user_id,
                'reason', rf.reason,
                'resolved', rf.resolved,
                'active', rf.active,
                'resolvedAt', rf.resolved_at,
                'createdAt', rf.created_at
            )
            ORDER BY rf.created_at DESC
        )
        FROM recipe_flags rf
        WHERE rf.recipe_id = r.id
    ) AS flags,
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', t.id,
                'name', t.name,
                'categoryId', t.category_id
            )
            ORDER BY t.name
        )
        FROM recipes_tags rt
        JOIN tags t ON rt.tag_id = t.id
        WHERE rt.recipe_id = r.id
    ) AS tags
FROM
    recipes r
/*--------------------------------------------------------------------------------------------------*/
LEFT JOIN recipe_flags rf ON rf.recipe_id = r.id AND rf.active = true
/*--------------------------------------------------------------------------------------------------*/
WHERE
    rf.recipe_id IS NULL
ORDER BY
    r.rating DESC,
    r.created_at DESC
LIMIT  $1 OFFSET $2;
