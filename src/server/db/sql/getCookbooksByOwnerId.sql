-- Fetch all cookbooks owned by a specific user
-- Parameters:
--   $1 :: int    – ownerId (user ID of the cookbook owner)
--
-- Returns cookbooks ordered by owner_order, then by title, with recipe details as JSON arrays.
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
    ) AS "recipeCount",
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
    c.owner_id = $1
ORDER BY
    c.owner_order ASC NULLS LAST,
    c.title;
