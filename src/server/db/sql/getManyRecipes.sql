SELECT
    r.id,
    r.display_id AS "displayId",
    r.title,
    r.language,
    r.author_id AS "authorId",
    r.time,
    r.portion_size AS "portionSize",
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
                'name', COALESCE(tr.name, t.slug),
                'categoryId', t.category_id
            )
            ORDER BY COALESCE(tr.name, t.slug)
        )
        FROM recipes_tags rt
        JOIN tags t ON rt.tag_id = t.id
        LEFT JOIN tag_translations tr ON tr.tag_id = t.id AND tr.language = r.language
        WHERE rt.recipe_id = r.id
    ) AS tags
FROM
    recipes r
/*--------------------------------------------------------------------------------------------------*/
LEFT JOIN recipe_flags rf ON rf.recipe_id = r.id AND rf.active = true
/*--------------------------------------------------------------------------------------------------*/
WHERE
    r.language = $1
    AND rf.recipe_id IS NULL
ORDER BY
    r.rating DESC,
    r.created_at DESC
LIMIT  $2 OFFSET $3;
