-- Fetch hub tags eligible for indexing (sitemap entries and the /recepty index)
-- Parameters:
--   $1 :: int    – threshold (minimum number of unflagged recipes a tag must have)
--
-- For each tag, counts its non-flagged recipes and returns only tags meeting the
-- threshold, along with that count and the most recent recipe update time. The
-- count is what orders the hub index, so the strongest hubs take the earliest
-- link positions on the page that links to all of them.
SELECT
    t.slug AS "slug",
    COUNT(*)::int AS "recipeCount",
    MAX(r.updated_at) AS "lastModified"
FROM
    tags t
/*--------------------------------------------------------------------------------------------------*/
JOIN recipes_tags rt ON rt.tag_id = t.id
JOIN recipes r ON r.id = rt.recipe_id
/*--------------------------------------------------------------------------------------------------*/
WHERE
    NOT EXISTS (
        SELECT 1
        FROM recipe_flags f
        WHERE f.recipe_id = r.id
          AND f.active
    )
GROUP BY
    t.slug
HAVING
    COUNT(*) >= $1;
