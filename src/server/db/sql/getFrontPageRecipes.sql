SELECT
    r.id,
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
LEFT JOIN recipe_flags rf ON rf.recipeId = r.id AND rf.active = true
/*--------------------------------------------------------------------------------------------------*/
WHERE
    r.timesRated >= ? AND r.language = ?
    AND rf.recipeId IS NULL
ORDER BY
    r.rating DESC,
    r.createdAt DESC
LIMIT ? OFFSET ?; 
