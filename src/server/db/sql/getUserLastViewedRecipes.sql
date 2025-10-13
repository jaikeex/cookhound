-- Fetch the most recently viewed recipes for a user
-- Parameters:
--   $1 :: int    – userId (user ID)
--   $2 :: int    – limit (maximum number of recipes to return)
--
-- Returns recipes ordered by most recent visit time.
SELECT
    r.id,
    r.display_id AS "displayId",
    r.title,
    r.image_url AS "imageUrl",
    r.rating,
    r.times_rated AS "timesRated",
    r.time,
    r.portion_size AS "portionSize"
FROM
    user_visited_recipes uvr
JOIN
    recipes r ON uvr.recipe_id = r.id
WHERE
    uvr.user_id = $1
ORDER BY
    uvr.visited_at DESC
LIMIT $2; 
