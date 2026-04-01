-- Reorder all bookmarks for a user according to the provided array of cookbook IDs.
-- Parameters:
--   $1 :: int      – userId
--   $2 :: int[]    – orderedCookbookIds (must list every bookmark of the user)
--
-- The bookmark_order becomes the 1-based index of cookbook_id inside the array.
UPDATE cookbook_bookmarks
SET    bookmark_order = array_position($2::int[], cookbook_id)
WHERE  user_id = $1;
