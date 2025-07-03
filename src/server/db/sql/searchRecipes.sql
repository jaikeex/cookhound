SELECT
    DISTINCT r.id,
    r.displayId,
    r.title,
    r.imageUrl,
    r.rating,
    r.timesRated,
    r.time,
    r.portionSize,
    r.createdAt
FROM
    recipes r
/*--------------------------------------------------------------------------------------------------*/
LEFT JOIN recipes_ingredients ri ON ri.recipeId = r.id
LEFT JOIN ingredients i ON i.id = ri.ingredientId
LEFT JOIN instructions instr ON instr.recipeId = r.id
LEFT JOIN recipe_flags rf ON rf.recipeId = r.id AND rf.active = true
/*--------------------------------------------------------------------------------------------------*/
WHERE
    r.language = ?
    AND rf.recipeId IS NULL
    AND (
        r.title LIKE CONCAT('%', ?, '%')
        OR r.notes LIKE CONCAT('%', ?, '%')
        OR i.name LIKE CONCAT('%', ?, '%')
        OR instr.text LIKE CONCAT('%', ?, '%')
    )
ORDER BY
    r.rating DESC,
    r.createdAt DESC
LIMIT ? OFFSET ?; 
