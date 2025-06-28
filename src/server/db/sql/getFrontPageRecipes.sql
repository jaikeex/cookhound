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
            instr.text
        )
        FROM instructions instr
        WHERE instr.recipeId = r.id
        ORDER BY instr.step
    ) AS instructions
FROM
    recipes r
WHERE
    r.timesRated >= ? AND r.language = ?
ORDER BY
    r.rating DESC,
    r.createdAt DESC
LIMIT ? OFFSET ?; 
