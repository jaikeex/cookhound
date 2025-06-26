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
    ) AS instructions
FROM
    recipes r
WHERE
    r.id = ?;
