-- Fetch a cookbook by its display ID with all associated recipes
-- Parameters:
--   $1 :: text   – displayId (unique display identifier for the cookbook)
--
-- Returns cookbook details with an ordered JSON array of recipes.
SELECT
    c.id,
    c.display_id      AS "displayId",
    c.owner_id        AS "ownerId",
    c.title,
    c.description,
    c.language,
    c.cover_image_url AS "coverImageUrl",
    c.visibility,
    c.created_at      AS "createdAt",
    c.updated_at      AS "updatedAt",
    (
        SELECT COUNT(*)::int
        FROM cookbooks_recipes cr
        WHERE cr.cookbook_id = c.id
    )   AS "recipeCount",
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', r.id,
                'displayId', r.display_id,
                'title', r.title,
                'imageUrl', r.image_url,
                'rating', r.rating,
                'timesRated', r.times_rated,
                'time', r.time,
                'portionSize', r.portion_size
            )
            ORDER BY cr.recipe_order, r.title
        )
        FROM cookbooks_recipes cr
        JOIN recipes r ON cr.recipe_id = r.id
        WHERE cr.cookbook_id = c.id
    ) AS recipes
    
FROM
    cookbooks c
WHERE
    c.display_id = $1;
