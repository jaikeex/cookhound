SELECT
    r.id,
    r.display_id AS "displayId",
    r.title,
    r.image_url AS "imageUrl",
    r.rating,
    r.times_rated AS "timesRated",
    r.time,
    r.portion_size AS "portionSize",
    r.created_at,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM recipe_flags rf 
            WHERE rf.recipe_id = r.id AND rf.active = true
        ) THEN (
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
            WHERE rf.recipe_id = r.id AND rf.active = true
        )
        ELSE NULL
    END AS flags
FROM
    recipes r
WHERE
    r.author_id = $1
    AND r.language = $2
ORDER BY
    r.created_at DESC
LIMIT $3 OFFSET $4;
