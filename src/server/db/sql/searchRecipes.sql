SELECT
    DISTINCT r.id,
    r.display_id AS "displayId",
    r.title,
    r.image_url AS "imageUrl",
    r.rating,
    r.times_rated AS "timesRated",
    r.time,
    r.portion_size AS "portionSize",
    r.created_at AS "createdAt"
FROM
    recipes r
/*--------------------------------------------------------------------------------------------------*/
LEFT JOIN recipes_ingredients ri ON ri.recipe_id = r.id
LEFT JOIN ingredients i ON i.id = ri.ingredient_id
LEFT JOIN instructions instr ON instr.recipe_id = r.id
LEFT JOIN recipe_flags rf ON rf.recipe_id = r.id AND rf.active = true
/*--------------------------------------------------------------------------------------------------*/
WHERE
    r.language = $1
    AND rf.recipe_id IS NULL
    AND (
        r.title ILIKE '%' || $2 || '%'
        OR r.notes ILIKE '%' || $2 || '%'
        OR i.name ILIKE '%' || $2 || '%'
        OR instr.text ILIKE '%' || $2 || '%'
    )
ORDER BY
    r.rating DESC NULLS LAST,
    r.created_at DESC
LIMIT $3 OFFSET $4; 
