SELECT
    r.id,
    r.display_id AS "displayId",
    r.title,
    r.image_url AS "imageUrl",
    r.rating,
    r.times_rated AS "timesRated",
    r.time,
    r.portion_size AS "portionSize",
    r.created_at
FROM
    recipes r
/*--------------------------------------------------------------------------------------------------*/
LEFT JOIN recipe_flags rf ON rf.recipe_id = r.id AND rf.active = true
/*--------------------------------------------------------------------------------------------------*/
WHERE
    r.times_rated >= $1 AND r.language = $2
    AND rf.recipe_id IS NULL
ORDER BY
    r.rating DESC,
    r.created_at DESC
LIMIT  $3 OFFSET $4; 
