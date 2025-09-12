SELECT
    DISTINCT r.id,
    r.displayId,
    r.title,
    r.imageUrl,
    r.rating,
    r.timesRated,
    r.time,
    r.portionSize,
    r.createdAt,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM recipe_flags rf_check 
            WHERE rf_check.recipeId = r.id AND rf_check.active = true
        ) THEN (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', rf_flags.id,
                    'userId', rf_flags.userId,
                    'reason', rf_flags.reason,
                    'resolved', rf_flags.resolved,
                    'active', rf_flags.active,
                    'resolvedAt', rf_flags.resolvedAt,
                    'createdAt', rf_flags.createdAt
                )
            )
            FROM recipe_flags rf_flags
            WHERE rf_flags.recipeId = r.id AND rf_flags.active = true
            ORDER BY rf_flags.createdAt DESC
        )
        ELSE NULL
    END AS flags
FROM
    recipes r
/*--------------------------------------------------------------------------------------------------*/
LEFT JOIN recipes_ingredients ri ON ri.recipeId = r.id
LEFT JOIN ingredients i ON i.id = ri.ingredientId
LEFT JOIN instructions instr ON instr.recipeId = r.id
/*--------------------------------------------------------------------------------------------------*/
WHERE
    r.authorId = ?
    AND r.language = ?
    AND (
        r.title LIKE CONCAT('%', ?, '%')
        OR r.notes LIKE CONCAT('%', ?, '%')
        OR i.name LIKE CONCAT('%', ?, '%')
        OR instr.text LIKE CONCAT('%', ?, '%')
    )
ORDER BY
    r.createdAt DESC
LIMIT ? OFFSET ?;
