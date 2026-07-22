-- Fetch hub tags eligible for indexing in the sitemap
-- Parameters:
--   $1 :: int    – threshold (minimum number of unflagged recipes a tag must have)
--
-- For each tag, counts its non-flagged recipes and returns only tags meeting the
-- threshold, along with the most recent recipe update time.
SELECT
    t.slug AS "slug",
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
