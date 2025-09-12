SELECT
    r.id,
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
            FROM recipe_flags rf 
            WHERE rf.recipeId = r.id AND rf.active = true
        ) THEN (
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
            WHERE rf.recipeId = r.id AND rf.active = true
            ORDER BY rf.createdAt DESC
        )
        ELSE NULL
    END AS flags
FROM
    recipes r
WHERE
    r.authorId = ?
    AND r.language = ?
ORDER BY
    r.createdAt DESC
LIMIT ? OFFSET ?;
