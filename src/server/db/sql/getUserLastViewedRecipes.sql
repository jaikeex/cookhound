SELECT
    r.id,
    r.displayId,
    r.title,
    r.imageUrl,
    r.rating,
    r.timesRated,
    r.time,
    r.portionSize
FROM
    user_visited_recipes uvr
JOIN
    recipes r ON uvr.recipeId = r.id
WHERE
    uvr.userId = ?
ORDER BY
    uvr.visitedAt DESC
LIMIT ?; 
