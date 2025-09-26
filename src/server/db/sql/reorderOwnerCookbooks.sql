-- Reorder all cookbooks owned by a user according to the provided array of cookbook IDs.
-- Parameters:
--   $1 :: int      – ownerId
--   $2 :: int[]    – orderedCookbookIds (must list every cookbook of the owner)
--
-- The owner_order becomes the 1-based index of id inside the array.
UPDATE cookbooks
SET    owner_order = array_position($2::int[], id)
WHERE  owner_id = $1;
