SELECT
    r.id,
    r.displayId,
    r.title,
    r.language,
    r.authorId,
    r.time,
    r.portionSize,
    r.notes,
    r.imageUrl,
    r.rating,
    r.timesRated,
    r.timesViewed,
    r.createdAt,
    r.updatedAt,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', i.id,
                'name', i.name,
                'quantity', ri.quantity
            )
        )
        FROM recipes_ingredients ri
        JOIN ingredients i ON ri.ingredientId = i.id
        WHERE ri.recipeId = r.id
        ORDER BY ri.ingredientOrder
    ) AS ingredients,
    (
        SELECT JSON_ARRAYAGG(
            i.text
        )
        FROM instructions i
        WHERE i.recipeId = r.id
        ORDER BY i.step
    ) AS instructions,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', rf.id,
                'userId', rf.userId,
                'reason', rf.reason,
                'resolved', rf.resolved,
                'active', rf.active,
                'resolvedAt', rf.resolvedAt,
                'createdAt', rf.createdAt
            )
        )
        FROM recipe_flags rf
        WHERE rf.recipeId = r.id
        ORDER BY rf.createdAt DESC
    ) AS flags,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', t.id,
                'name', COALESCE(tr.name, t.slug),
                'categoryId', t.categoryId
            )
        )
        FROM recipes_tags rt
        JOIN tags t ON rt.tagId = t.id
        LEFT JOIN tag_translations tr ON tr.tagId = t.id AND tr.language = r.language
        WHERE rt.recipeId = r.id
        ORDER BY COALESCE(tr.name, t.slug)
    ) AS tags
FROM
    recipes r
WHERE
    r.id = ?;
